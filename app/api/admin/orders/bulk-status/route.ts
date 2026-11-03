import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import {
  canTransitionOrderStatus,
  type OrderStatus
} from "@/features/orders/state-machine";

const bulkStatusUpdateSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(100),
  newStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "REFUNDED",
    "FAILED_DELIVERY"
  ]),
  note: z.string().max(500).optional()
});

export type BulkOrderStatusResult = {
  id: string;
  orderNumber: string;
  success: boolean;
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
  error?: string;
};

// POST /api/admin/orders/bulk-status
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bulkStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { orderIds, newStatus, note } = parsed.data;

  // Bulk actions never modify payment processing directly
  if (newStatus === "REFUNDED") {
    return NextResponse.json(
      {
        error:
          "Bulk refund is disabled. Refunds require financial gateway reconciliation on the individual order detail page."
      },
      { status: 400 }
    );
  }

  const results: BulkOrderStatusResult[] = [];

  for (const id of orderIds) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        select: { id: true, orderNumber: true, status: true }
      });

      if (!order) {
        results.push({
          id,
          orderNumber: id,
          success: false,
          error: "Order not found"
        });
        continue;
      }

      if (order.status === newStatus) {
        results.push({
          id,
          orderNumber: order.orderNumber,
          success: false,
          error: `Order is already in status "${newStatus}".`
        });
        continue;
      }

      if (!canTransitionOrderStatus(order.status as OrderStatus, newStatus as OrderStatus)) {
        results.push({
          id,
          orderNumber: order.orderNumber,
          previousStatus: order.status as OrderStatus,
          success: false,
          error: `Cannot transition from ${order.status} to ${newStatus}.`
        });
        continue;
      }

      // Execute status update with exact same audit and inventory guarantees as single updater
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: {
            status: newStatus,
            ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {})
          }
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            previousStatus: order.status as OrderStatus,
            newStatus: newStatus as OrderStatus,
            actorId: userId ?? null,
            note: note ?? "Bulk status update"
          }
        });

        await tx.auditLog.create({
          data: {
            actorId: userId ?? null,
            action: "ORDER_STATUS_CHANGED",
            resource: "Order",
            resourceId: id,
            previous: { status: order.status },
            next: { status: newStatus, note, bulk: true }
          }
        });

        // CANCELLED: release inventory reservation safely
        if (newStatus === "CANCELLED") {
          const items = await tx.orderItem.findMany({ where: { orderId: id } });
          for (const item of items) {
            await tx.$executeRaw`
              UPDATE "ProductVariant"
              SET "reservedQuantity" = GREATEST(0, "reservedQuantity" - ${item.quantity})
              WHERE id = ${item.variantId}
            `;

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                actorId: userId ?? null,
                type: "RELEASE",
                quantity: item.quantity,
                reason: `Order ${order.orderNumber} bulk cancelled`
              }
            });
          }
        }

        // DELIVERED: commit sale and decrement stock & reservation
        if (newStatus === "DELIVERED") {
          const items = await tx.orderItem.findMany({ where: { orderId: id } });
          for (const item of items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
                reservedQuantity: { decrement: item.quantity }
              }
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                actorId: userId ?? null,
                type: "SALE",
                quantity: item.quantity,
                reason: `Order ${order.orderNumber} bulk delivered`
              }
            });
          }
        }

        // RETURNED: restore stockQuantity to inventory
        if (newStatus === "RETURNED") {
          const items = await tx.orderItem.findMany({ where: { orderId: id } });
          for (const item of items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } }
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                actorId: userId ?? null,
                type: "RETURN",
                quantity: item.quantity,
                reason: `Order ${order.orderNumber} bulk returned`
              }
            });
          }
        }
      });

      results.push({
        id,
        orderNumber: order.orderNumber,
        previousStatus: order.status as OrderStatus,
        newStatus: newStatus as OrderStatus,
        success: true
      });
    } catch (err) {
      results.push({
        id,
        orderNumber: id,
        success: false,
        error: err instanceof Error ? err.message : "Transaction failed"
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    total: orderIds.length,
    succeeded,
    failed,
    results
  });
}

