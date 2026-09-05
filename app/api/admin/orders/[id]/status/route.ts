import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { transitionOrderStatus, type OrderStatus } from "@/features/orders/state-machine";

import { isValidAdminSession } from "@/lib/auth/admin-auth";

async function requireAdmin(request: NextRequest) {
  const adminCookie = request.cookies.get("admin_session")?.value;
  if (isValidAdminSession(adminCookie)) {
    return { error: null, userId: null };
  }

  const session = await getServerSession();
  if (!session?.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.userId },
    include: { role: true }
  });

  const isAdmin = userRoles.some((ur) =>
    ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null };
  }

  return { error: null, userId: session.userId };
}

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
  const { error, userId } = await requireAdmin(request);
  if (error) return error;

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

  // Enforce state machine — throws OrderStateError on invalid transition
  let resolvedStatus: OrderStatus;
  try {
    resolvedStatus = transitionOrderStatus(order.status as OrderStatus, newStatus as OrderStatus);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid status transition.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        status: resolvedStatus,
        ...(resolvedStatus === "CANCELLED" ? { cancelledAt: new Date() } : {})
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

    // Release inventory reservation on cancellation
    if (resolvedStatus === "CANCELLED") {
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedQuantity: { decrement: item.quantity } }
        });

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

    // Commit inventory (reduce stockQuantity) on delivery
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
  });

  return NextResponse.json({ orderId: id, status: resolvedStatus });
}
