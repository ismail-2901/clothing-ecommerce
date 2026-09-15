import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { calculateCartTotals } from "@/features/pricing/pricing";
import { generateOrderNumber } from "@/features/orders/order-service";
import { scoreOrderRisk } from "@/features/risk/risk-score";
import { getPaymentProvider } from "@/lib/payments/providers";
import { storeConfig, storePolicies } from "@/config/store";
import { cookies } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/notifications/notification-service";
import { trackCustomerEventAsync } from "@/features/admin/customer-events";
import { generateRandomString } from "better-auth/crypto";

const GUEST_ORDER_TOKEN_COOKIE = "guest_order_token";
const GUEST_ORDER_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

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
  shippingFee: z.number().int().min(0).default(8000),
  couponCode: z.string().max(50).optional(),
  paymentProvider: z.enum(["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"]),
  // Inline cart: used when no server-side Cart record exists (localStorage-based storefront)
  cartItems: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().min(1).max(50)
    })
  ).optional()
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

  // -----------------------------------------------------------------------
  // Cart resolution: DB cart first, fall back to inline cartItems
  // -----------------------------------------------------------------------
  const cartWhere = session?.userId
    ? { userId: session.userId, status: "ACTIVE" as const }
    : anonymousId
      ? { anonymousId, status: "ACTIVE" as const }
      : null;

  const dbCart = cartWhere
    ? await prisma.cart.findFirst({
        where: cartWhere,
        include: {
          items: { include: { variant: { include: { product: true } } } },
          coupon: true
        }
      })
    : null;

  const hasDbCart = !!dbCart && dbCart.items.length > 0;
  const hasInlineCart = !!input.cartItems && input.cartItems.length > 0;

  if (!hasDbCart && !hasInlineCart) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // -----------------------------------------------------------------------
  // Build resolved cart lines — DB or inline (never trust client prices)
  // -----------------------------------------------------------------------
  type ResolvedLine = {
    id: string;
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    variantId: string;
    variantSku: string;
    variantColor: string;
    variantSize: string;
    snapshotImage: string;
    productSlug: string;
  };

  let resolvedLines: ResolvedLine[] = [];
  let cartId: string | null = hasDbCart ? dbCart!.id : null;

  if (hasDbCart) {
    resolvedLines = dbCart!.items.map((item) => ({
      id: item.id,
      productId: item.variant.productId,
      name: item.variant.product.name,
      unitPrice: item.variant.priceOverride ?? item.variant.product.basePrice,
      quantity: item.quantity,
      variantId: item.variant.id,
      variantSku: item.variant.sku,
      variantColor: item.variant.color,
      variantSize: item.variant.size,
      snapshotImage: "",
      productSlug: item.variant.product.slug
    }));
  } else {
    // Inline cart: resolve all from DB — never trust any client-provided price/name/image
    const variantIds = input.cartItems!.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isAvailable: true,
        deletedAt: null,
        product: { status: "PUBLISHED", deletedAt: null }
      },
      include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } }
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of input.cartItems!) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: "Product variant not found or unavailable.", variantId: item.variantId },
          { status: 422 }
        );
      }
      const available = variant.stockQuantity - variant.reservedQuantity;
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${variant.product.name}" (${variant.color} / ${variant.size}). Available: ${available}.`, variantId: item.variantId },
          { status: 422 }
        );
      }
      resolvedLines.push({
        id: `inline-${variant.id}`,
        productId: variant.productId,
        name: variant.product.name,
        unitPrice: variant.priceOverride ?? variant.product.basePrice,
        quantity: item.quantity,
        variantId: variant.id,
        variantSku: variant.sku,
        variantColor: variant.color,
        variantSize: variant.size,
        snapshotImage: (variant.product.images as any[])?.[0]?.url ?? "",
        productSlug: variant.product.slug
      });
    }
  }

  // -----------------------------------------------------------------------
  // Coupon validation
  // -----------------------------------------------------------------------
  let couponId: string | null = null;
  let resolvedCoupon = (hasDbCart ? dbCart!.coupon : null) ?? null;

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

  // -----------------------------------------------------------------------
  // Pricing engine (DB prices only)
  // -----------------------------------------------------------------------
  let pricing;
  try {
    const subtotal = resolvedLines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
    const resolvedShippingFee = subtotal >= storePolicies.shipping.freeThreshold * 100 ? 0 : input.shippingFee;
    pricing = calculateCartTotals({
      lines: resolvedLines.map(({ id, productId, name, unitPrice, quantity }) => ({ id, productId, name, unitPrice, quantity })),
      coupon: couponRule,
      shippingFee: resolvedShippingFee
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pricing error.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // -----------------------------------------------------------------------
  // Payment
  // -----------------------------------------------------------------------
  const orderNumber = generateOrderNumber(ORDER_PREFIX);
  const paymentProvider = getPaymentProvider(input.paymentProvider);
  let paymentResult;
  try {
    paymentResult = await paymentProvider.createPayment({
      orderId: orderNumber,
      amount: pricing.grandTotal,
      currency: storeConfig.currency,
      customerEmail: input.email,
      customerPhone: input.phone,
      description: `Order ${orderNumber}`,
      returnUrl: `${storeConfig.url}/checkout/confirm`
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initialisation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (paymentResult.status === "FAILED") {
    return NextResponse.json({ error: paymentResult.error || "Payment failed." }, { status: 400 });
  }

  // -----------------------------------------------------------------------
  // DB transaction: validate stock + reserve + create order
  // -----------------------------------------------------------------------
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Lock and validate each variant stock inside transaction (race-condition safe)
      for (const line of resolvedLines) {
        const variant = await tx.productVariant.findUnique({ where: { id: line.variantId } });
        if (!variant || !variant.isAvailable) {
          throw new Error(`${line.name} (${line.variantSize}/${line.variantColor}) is no longer available.`);
        }
        const available = variant.stockQuantity - variant.reservedQuantity;
        if (available < line.quantity) {
          throw new Error(`Only ${available} unit(s) of ${line.name} (${line.variantSize}) are available.`);
        }
      }

      // Reserve inventory for each variant
      for (const line of resolvedLines) {
        await tx.productVariant.update({
          where: { id: line.variantId },
          data: { reservedQuantity: { increment: line.quantity } }
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: line.variantId,
            actorId: session?.userId ?? null,
            type: "RESERVATION",
            quantity: line.quantity,
            reason: "Order checkout reservation"
          }
        });
      }

      // Coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } }
        });
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          couponId,
          status: "PENDING",
          paymentStatus: (input.paymentProvider === "COD" || paymentResult.status === "PENDING") ? "PENDING" : "PAID",
          guestEmail: session ? null : input.email,
          guestPhone: session ? null : input.phone,
          // Opaque token for guest order retrieval — only set for unauthenticated orders
          guestToken: session ? null : await generateRandomString(48),
          subtotal: pricing.subtotal,
          discountTotal: pricing.couponDiscount,
          shippingTotal: pricing.shippingFee,
          grandTotal: pricing.grandTotal,
          currency: storeConfig.currency,
          deliveryAddress: input.deliveryAddress,
          customerSnapshot: {
            email: input.email,
            phone: input.phone,
            name: input.deliveryAddress.name
          }
        }
      });

      // Create order items
      for (const line of resolvedLines) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: line.productId,
            variantId: line.variantId,
            sku: line.variantSku,
            name: line.name,
            color: line.variantColor,
            size: line.variantSize,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            lineTotal: line.unitPrice * line.quantity,
            productSnapshot: {
              name: line.name,
              slug: line.productSlug,
              sku: line.variantSku,
              color: line.variantColor,
              size: line.variantSize,
              price: line.unitPrice,
              image: line.snapshotImage
            }
          }
        });
      }

      // Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: input.paymentProvider,
          amount: pricing.grandTotal,
          currency: storeConfig.currency,
          status: (input.paymentProvider === "COD" || paymentResult.status === "PENDING") ? "PENDING" : "PAID",
          providerPaymentId: paymentResult.redirectUrl ?? null
        }
      });

      // Status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          previousStatus: null,
          newStatus: "PENDING",
          actorId: session?.userId ?? null,
          note: "Order placed"
        }
      });

      // Mark DB cart as checked out (no-op for inline-cart path)
      if (cartId) {
        await tx.cart.update({ where: { id: cartId }, data: { status: "CHECKED_OUT" } });
      }

      return newOrder;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order creation failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Background: risk score for COD orders
  if (input.paymentProvider === "COD" && session?.userId) {
    computeAndStoreRisk(order.id, session.userId).catch(() => undefined);
  }

  // Fire-and-forget: confirmation email + customer event
  const itemCount = resolvedLines.reduce((s, l) => s + l.quantity, 0);
  sendOrderConfirmationEmail({
    to: input.email,
    orderNumber: order.orderNumber,
    orderId: order.id,
    grandTotal: order.grandTotal,
    itemCount,
    deliveryName: input.deliveryAddress.name
  }).catch(() => undefined);

  if (session?.userId) {
    trackCustomerEventAsync({
      userId: session.userId,
      type: "ORDER_CREATED",
      metadata: { orderId: order.id, orderNumber: order.orderNumber, grandTotal: order.grandTotal }
    });
  }

  const response = NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    grandTotal: order.grandTotal,
    paymentStatus: paymentResult.status,
    paymentUrl: paymentResult.redirectUrl ?? null
  }, { status: 201 });

  if (!session) {
    response.cookies.delete(ANON_COOKIE);
    // Set the guest order token as a short-lived HttpOnly cookie.
    // The GET /api/orders/[id] endpoint will verify this token for unauthenticated access.
    if (order.guestToken) {
      response.cookies.set(GUEST_ORDER_TOKEN_COOKIE, order.guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: GUEST_ORDER_TOKEN_TTL_SECONDS
      });
    }
  }

  return response;
}


async function computeAndStoreRisk(orderId: string, userId: string) {
  const now = Date.now();
  const [failedDeliveries, codRefusals, cancellations, returns, paymentFailures, recentOrders, user] =
    await Promise.all([
      // Orders that physically failed delivery
      prisma.order.count({ where: { userId, status: "FAILED_DELIVERY" } }),
      // COD orders that were cancelled after dispatch (proxy for refusal at door)
      prisma.order.count({
        where: {
          userId,
          status: "CANCELLED",
          payments: { some: { provider: "COD" } },
          // Only count cancellations that happened after order was confirmed (i.e. after dispatch, not pre-fulfillment)
          history: { some: { newStatus: "CONFIRMED" } }
        }
      }),
      prisma.order.count({
        where: { userId, status: "CANCELLED", createdAt: { gte: new Date(now - 90 * 86400000) } }
      }),
      prisma.order.count({
        where: {
          userId,
          status: { in: ["RETURN_REQUESTED", "RETURNED"] },
          createdAt: { gte: new Date(now - 180 * 86400000) }
        }
      }),
      prisma.payment.count({
        where: {
          order: { userId },
          status: "FAILED",
          createdAt: { gte: new Date(now - 30 * 86400000) }
        }
      }),
      prisma.order.count({
        where: { userId, createdAt: { gte: new Date(now - 86400000) } }
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

  // Score weights mirror risk-score.ts so the DB stores meaningful signal weights
  const SIGNAL_WEIGHTS: Record<string, number> = {
    "Multiple failed deliveries": 22,
    "Repeated COD refusals": 18,
    "High recent cancellation frequency": 16,
    "Elevated return frequency": 12,
    "Recent payment failures": 12,
    "Unusual order velocity": 10,
    "New account with high order value": 10,
    "Order value is far above customer average": 10
  };

  await prisma.riskAssessment.create({
    data: {
      orderId,
      customerId: userId,
      score: result.score,
      level: result.level,
      recommendedAction: result.recommendedAction,
      signals: {
        create: result.signals.map((label) => ({ label, weight: SIGNAL_WEIGHTS[label] ?? 0 }))
      }
    }
  });
}
