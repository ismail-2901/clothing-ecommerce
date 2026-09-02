import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { calculateCartTotals } from "@/features/pricing/pricing";
import { generateOrderNumber } from "@/features/orders/order-service";
import { scoreOrderRisk } from "@/features/risk/risk-score";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/notifications/notification-service";
import { trackCustomerEventAsync } from "@/features/admin/customer-events";

const ANON_COOKIE = "cart_anon_id";
const ORDER_PREFIX = process.env.ORDER_PREFIX ?? "ATC";

const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  deliveryAddress: z.object({
    name: z.string().min(1).max(100),
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    area: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().length(2).default("BD")
  }),
  shippingFee: z.int().min(0),
  couponCode: z.string().max(50).optional(),
  paymentProvider: z.enum(["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"])
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const input = parsed.data;
  const session = await getServerSession();
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(ANON_COOKIE)?.value;

  // Resolve cart — authenticated or anonymous
  const cartWhere = session?.userId
    ? { userId: session.userId, status: "ACTIVE" as const }
    : anonymousId
      ? { anonymousId, status: "ACTIVE" as const }
      : null;

  if (!cartWhere) {
    return NextResponse.json({ error: "No active cart found." }, { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: cartWhere,
    include: {
      items: {
        include: {
          variant: { include: { product: true } }
        }
      },
      coupon: true
    }
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Validate coupon if provided
  let couponId: string | null = null;
  let resolvedCoupon = cart.coupon ?? null;

  if (input.couponCode && !resolvedCoupon) {
    resolvedCoupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode, status: "ACTIVE" }
    });
  }

  if (resolvedCoupon) {
    const now = new Date();
    if (resolvedCoupon.startsAt && resolvedCoupon.startsAt > now) {
      return NextResponse.json({ error: "Coupon is not active yet." }, { status: 422 });
    }
    if (resolvedCoupon.endsAt && resolvedCoupon.endsAt < now) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 422 });
    }
    if (resolvedCoupon.usageLimit && resolvedCoupon.usageCount >= resolvedCoupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 422 });
    }
    couponId = resolvedCoupon.id;
  }

  // Build pricing lines from DB (never trust client prices)
  const pricingLines = cart.items.map((item) => {
    const unitPrice = item.variant.priceOverride ?? item.variant.product.basePrice;
    return {
      id: item.id,
      productId: item.variant.productId,
      name: item.variant.product.name,
      unitPrice,
      quantity: item.quantity
    };
  });

  const couponRule = resolvedCoupon
    ? {
        code: resolvedCoupon.code,
        kind: resolvedCoupon.type as "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING",
        value: resolvedCoupon.value,
        minSubtotal: resolvedCoupon.minSubtotal ?? undefined,
        maxDiscount: resolvedCoupon.maxDiscount ?? undefined,
        startsAt: resolvedCoupon.startsAt ?? undefined,
        endsAt: resolvedCoupon.endsAt ?? undefined
      }
    : undefined;

  let pricing;
  try {
    pricing = calculateCartTotals({ lines: pricingLines, coupon: couponRule, shippingFee: input.shippingFee });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pricing error.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // DB transaction: validate stock + decrement + create order
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Lock and validate each variant stock
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variant.id } });
        if (!variant || !variant.isAvailable) {
          throw new Error(`${item.variant.product.name} (${item.variant.size}/${item.variant.color}) is no longer available.`);
        }
        const available = variant.stockQuantity - variant.reservedQuantity;
        if (available < item.quantity) {
          throw new Error(`Only ${available} unit(s) of ${item.variant.product.name} (${item.variant.size}) are available.`);
        }
      }

      // Decrement inventory (reservedQuantity) for each variant
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: { reservedQuantity: { increment: item.quantity } }
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variant.id,
            actorId: session?.userId ?? null,
            type: "RESERVATION",
            quantity: item.quantity,
            reason: "Order checkout reservation"
          }
        });
      }

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } }
        });
      }

      // Create order
      const orderNumber = generateOrderNumber(ORDER_PREFIX);
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          couponId,
          status: "PENDING",
          paymentStatus: "PENDING",
          guestEmail: session ? null : input.email,
          guestPhone: session ? null : input.phone,
          subtotal: pricing.subtotal,
          discountTotal: pricing.couponDiscount,
          shippingTotal: pricing.shippingFee,
          grandTotal: pricing.grandTotal,
          deliveryAddress: input.deliveryAddress,
          customerSnapshot: {
            email: input.email,
            phone: input.phone,
            name: input.deliveryAddress.name
          }
        }
      });

      // Create order items
      for (const item of cart.items) {
        const unitPrice = item.variant.priceOverride ?? item.variant.product.basePrice;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.variant.productId,
            variantId: item.variant.id,
            sku: item.variant.sku,
            name: item.variant.product.name,
            color: item.variant.color,
            size: item.variant.size,
            unitPrice,
            quantity: item.quantity,
            lineTotal: unitPrice * item.quantity,
            productSnapshot: {
              name: item.variant.product.name,
              slug: item.variant.product.slug,
              sku: item.variant.sku,
              color: item.variant.color,
              size: item.variant.size,
              price: unitPrice
            }
          }
        });
      }

      // Initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          previousStatus: null,
          newStatus: "PENDING",
          actorId: session?.userId ?? null,
          note: "Order placed"
        }
      });

      // Mark cart as checked out
      await tx.cart.update({ where: { id: cart.id }, data: { status: "CHECKED_OUT" } });

      return newOrder;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order creation failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Background: compute risk score for COD orders (non-blocking)
  if (input.paymentProvider === "COD" && session?.userId) {
    computeAndStoreRisk(order.id, session.userId).catch(() => undefined);
  }

  // Fire-and-forget: confirmation email + customer event
  const confirmEmail = input.email;
  const confirmName = input.deliveryAddress.name;
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  sendOrderConfirmationEmail({
    to: confirmEmail,
    orderNumber: order.orderNumber,
    orderId: order.id,
    grandTotal: order.grandTotal,
    itemCount,
    deliveryName: confirmName
  }).catch(() => undefined);

  if (session?.userId) {
    trackCustomerEventAsync({
      userId: session.userId,
      type: "ORDER_CREATED",
      metadata: { orderId: order.id, orderNumber: order.orderNumber, grandTotal: order.grandTotal }
    });
  }

  // Clear anon cookie if guest converted
  const response = NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    grandTotal: order.grandTotal
  }, { status: 201 });

  if (!session) {
    response.cookies.delete(ANON_COOKIE);
  }

  return response;
}

async function computeAndStoreRisk(orderId: string, userId: string) {
  const [failedDeliveries, codRefusals, cancellations, returns, paymentFailures, recentOrders, user] =
    await Promise.all([
      prisma.order.count({ where: { userId, status: "FAILED_DELIVERY" } }),
      prisma.order.count({ where: { userId, status: "FAILED_DELIVERY" } }), // placeholder — refine with payment field
      prisma.order.count({
        where: { userId, status: "CANCELLED", createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }
      }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["RETURN_REQUESTED", "RETURNED"] },
          createdAt: { gte: new Date(Date.now() - 180 * 86400000) }
        }
      }),
      prisma.payment.count({
        where: {
          order: { userId },
          status: "FAILED",
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) }
        }
      }),
      prisma.order.count({
        where: { userId, createdAt: { gte: new Date(Date.now() - 86400000) } }
      }),
      prisma.user.findUnique({ where: { id: userId } })
    ]);

  if (!user) return;

  const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / 86400000);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const result = scoreOrderRisk({
    failedDeliveries,
    codRefusals,
    cancellationsLast90Days: cancellations,
    returnsLast180Days: returns,
    paymentFailuresLast30Days: paymentFailures,
    ordersLast24Hours: recentOrders,
    accountAgeDays,
    orderValueMinor: order.grandTotal
  });

  // Delete and recreate assessment (upsert can't handle nested relation signals cleanly)
  await prisma.riskAssessment.deleteMany({ where: { orderId } });
  await prisma.riskAssessment.create({
    data: {
      orderId,
      customerId: userId,
      score: result.score,
      level: result.level,
      recommendedAction: result.recommendedAction,
      signals: {
        create: result.signals.map((label) => ({ label, weight: 0 }))
      }
    }
  });
}
