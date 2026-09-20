import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { transitionOrderStatus, type OrderStatus } from "@/features/orders/state-machine";

const statusUpdateSchema = z.object({
  newStatus: z.enum([
    "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED",
    "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED",
    "RETURNED", "REFUNDED", "FAILED_DELIVERY"
  ]),
  note: z.string().max(500).optional()
});

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/admin/orders/[id]/status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const { newStatus, note } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // BUG-37 FIX: Guard against transitioning to the already-current status
  if (order.status === newStatus) {
    return NextResponse.json(
      { error: `Order is already in status "${newStatus}".` },
      { status: 409 }
    );
  }

  // Enforce state machine — throws OrderStateError on invalid transition
  let resolvedStatus: OrderStatus;
  try {
    resolvedStatus = transitionOrderStatus(order.status as OrderStatus, newStatus as OrderStatus);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid status transition.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // ---------------------------------------------------------------------------
  // REFUNDED: call payment provider before opening the DB transaction.
  // A provider failure aborts cleanly without leaving DB in a partial state.
  // ---------------------------------------------------------------------------
  let refundReference: string | null = null;
  if (resolvedStatus === "REFUNDED") {
    try {
      const { getPaymentProvider } = await import("@/lib/payments/providers");
      const payment = await prisma.payment.findFirst({
        where: { orderId: id },
        orderBy: { createdAt: "desc" }
      });
      if (payment) {
        const provider = getPaymentProvider(
          payment.provider as import("@/lib/payments/payment-provider").PaymentProviderCode
        );
        const refundResult = await provider.refund({
          orderId: id,
          amount: order.grandTotal,
          reason: note ?? `Order ${order.orderNumber} refunded`,
          paymentReference: payment.providerPaymentId ?? undefined
        });
        if (!refundResult.success) {
          return NextResponse.json(
            { error: `Payment provider refund failed: ${refundResult.error ?? "unknown error"}` },
            { status: 502 }
          );
        }
        refundReference = refundResult.refundId;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refund call failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        status: resolvedStatus,
        ...(resolvedStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        ...(resolvedStatus === "REFUNDED" ? { paymentStatus: "REFUNDED" } : {})
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        previousStatus: order.status as OrderStatus,
        newStatus: resolvedStatus,
        actorId: userId ?? null,
        note: note ?? null
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: userId ?? null,
        action: "ORDER_STATUS_CHANGED",
        resource: "Order",
        resourceId: id,
        previous: { status: order.status },
        next: { status: resolvedStatus, note }
      }
    });

    // -------------------------------------------------------------------------
    // CANCELLED: release reservation (goods never left warehouse)
    // -------------------------------------------------------------------------
    if (resolvedStatus === "CANCELLED") {
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        // BUG-03 fix: use GREATEST(0, ...) to prevent reservedQuantity going negative
        // if an order is cancelled after partial processing or a double-cancel.
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
            reason: `Order ${order.orderNumber} cancelled`
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // DELIVERED: commit sale — decrement stockQuantity and clear reservation
    // -------------------------------------------------------------------------
    if (resolvedStatus === "DELIVERED") {
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
            reason: `Order ${order.orderNumber} delivered`
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // RETURNED: physical goods back in warehouse — restore stockQuantity.
    // reservedQuantity was zeroed at DELIVERED; do not decrement it again.
    // -------------------------------------------------------------------------
    if (resolvedStatus === "RETURNED") {
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
            reason: `Order ${order.orderNumber} returned`
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // REFUNDED: mark payment as refunded and persist provider refund reference.
    // If transitioning RETURN_REQUESTED → REFUNDED directly (no RETURNED step),
    // also restore stock because the refund implies the goods came back.
    // If RETURNED already ran, stock was restored there — do not double-restore.
    // -------------------------------------------------------------------------
    if (resolvedStatus === "REFUNDED") {
      await tx.payment.updateMany({
        where: { orderId: id },
        data: {
          status: "REFUNDED",
          ...(refundReference ? { providerPaymentId: refundReference } : {})
        }
      });

      // Direct skip: RETURN_REQUESTED → REFUNDED (goods implied returned)
      if (order.status === "RETURN_REQUESTED") {
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
              reason: `Order ${order.orderNumber} refunded directly — stock restored`
            }
          });
        }
      }
    }
  });

  return NextResponse.json({ orderId: id, status: resolvedStatus });
}
