import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCartTotals } from "@/features/pricing/pricing";
import { generateOrderNumber } from "@/features/orders/order-service";
import { getPaymentProvider } from "@/lib/payments/providers";
import { storeConfig } from "@/config/store";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { sendOrderConfirmationEmail } from "@/lib/notifications/notification-service";

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().trim().min(7),
  deliveryName: z.string().trim().min(2),
  deliveryLine1: z.string().trim().min(2),
  deliveryLine2: z.string().trim().optional(),
  deliveryCity: z.string().trim().min(2),
  deliveryArea: z.string().trim().optional(),
  deliveryPostalCode: z.string().trim().optional(),
  deliveryCountry: z.string().default("BD"),
  paymentProvider: z.enum(["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"]),
  cartItems: z.array(
    z.object({
      sku: z.string(),
      productId: z.string(),
      name: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().int().min(0),
      size: z.string().optional(),
      color: z.string().optional()
    })
  ),
  couponCode: z.string().optional()
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout request.", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.cartItems.length === 0) {
    return NextResponse.json(
      { error: "Cart empty." },
      { status: 400 }
    );
  }

  // Check coupon if provided
  let couponId: string | null = null;
  let couponDiscount = 0;

  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.couponCode.toUpperCase().trim(), status: "ACTIVE" }
    });
    if (coupon) {
      couponId = coupon.id;
      if (coupon.type === "PERCENTAGE") {
        couponDiscount = coupon.value;
      }
    }
  }

  const summary = calculateCartTotals({
    lines: data.cartItems.map((item, index) => ({
      id: `${item.sku}-${index}`,
      productId: item.productId,
      name: item.name,
      unitPrice: item.price,
      quantity: item.quantity
    })),
    shippingFee: 8000,
    coupon: data.couponCode
      ? {
          code: data.couponCode,
          kind: "PERCENTAGE" as const,
          value: couponDiscount || 10
        }
      : undefined,
    now: new Date()
  });

  const orderNumber = generateOrderNumber(storeConfig.orderPrefix);

  try {
    const paymentProvider = getPaymentProvider(data.paymentProvider);

    const paymentResult = await paymentProvider.createPayment({
      orderId: orderNumber,
      amount: summary.grandTotal,
      currency: storeConfig.currency,
      customerEmail: data.email,
      customerPhone: data.phone,
      description: `Order ${orderNumber}`,
      returnUrl: `${storeConfig.url}/checkout/confirm`
    });

    if (paymentResult.status === "FAILED") {
      return NextResponse.json(
        { error: paymentResult.error || "Payment failed." },
        { status: 400 }
      );
    }

    const session = await getServerSession().catch(() => null);

    // Save order in database with complete integrity
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          couponId,
          status: "PENDING",
          paymentStatus: (data.paymentProvider === "COD" || paymentResult.status === "PENDING") ? "PENDING" : "PAID",
          guestEmail: session?.userId ? null : data.email,
          guestPhone: session?.userId ? null : data.phone,
          subtotal: summary.subtotal,
          discountTotal: summary.couponDiscount,
          shippingTotal: summary.shippingFee,
          grandTotal: summary.grandTotal,
          currency: storeConfig.currency,
          deliveryAddress: {
            name: data.deliveryName,
            line1: data.deliveryLine1,
            line2: data.deliveryLine2 ?? "",
            city: data.deliveryCity,
            area: data.deliveryArea ?? "",
            postalCode: data.deliveryPostalCode ?? "",
            country: data.deliveryCountry || "BD"
          },
          customerSnapshot: {
            name: data.deliveryName,
            email: data.email,
            phone: data.phone
          }
        }
      });

      // 2. Create OrderItems & update stock
      for (const item of data.cartItems) {
        // Try finding variant by SKU or productId
        let variant = await tx.productVariant.findFirst({
          where: {
            OR: [
              { sku: item.sku },
              { productId: item.productId }
            ]
          },
          include: { product: true }
        });

        let product = variant?.product ?? null;
        if (!product) {
          product =
            (await tx.product.findUnique({
              where: { id: item.productId }
            })) || (await tx.product.findFirst());
        }

        if (!variant && product) {
          variant = await tx.productVariant.findFirst({
            where: { productId: product.id },
            include: { product: true }
          });

          if (!variant) {
            variant = await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                color: item.color || "Standard",
                size: item.size || "Regular",
                stockQuantity: 100
              },
              include: { product: true }
            });
          }
        }

        if (variant && product) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: product.id,
              variantId: variant.id,
              sku: variant.sku,
              name: item.name || product.name,
              color: variant.color,
              size: variant.size,
              unitPrice: item.price,
              quantity: item.quantity,
              lineTotal: item.price * item.quantity,
              productSnapshot: {
                name: item.name || product.name,
                sku: variant.sku,
                color: variant.color,
                size: variant.size,
                price: item.price
              }
            }
          });

          // Increment reserved quantity
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { reservedQuantity: { increment: item.quantity } }
          }).catch(() => undefined);
        }
      }

      // 3. Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          previousStatus: null,
          newStatus: "PENDING",
          actorId: session?.userId ?? null,
          note: "Order placed via online checkout"
        }
      });

      // 4. Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: data.paymentProvider,
          amount: summary.grandTotal,
          currency: storeConfig.currency,
          status: (data.paymentProvider === "COD" || paymentResult.status === "PENDING") ? "PENDING" : "PAID",
          providerPaymentId: paymentResult.redirectUrl || null
        }
      });

      // 5. Create In-App Notification for Admin
      const formattedAmount = (summary.grandTotal / 100).toLocaleString("en-BD", { style: "currency", currency: "BDT" });
      await tx.notification.create({
        data: {
          userId: null,
          channel: "IN_APP",
          title: `New Order Placed (#${orderNumber})`,
          body: `${data.deliveryName} placed an order for ${formattedAmount} via ${data.paymentProvider}. Ready for fulfillment.`,
          metadata: {
            orderId: newOrder.id,
            orderNumber,
            total: summary.grandTotal,
            customer: data.deliveryName,
            type: "ORDER",
            link: "/admin/orders"
          }
        }
      });

      // 6. Update coupon usage if used
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } }
        }).catch(() => undefined);
      }

      return newOrder;
    });

    // Send confirmation email asynchronously
    const itemCount = data.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    sendOrderConfirmationEmail({
      to: data.email,
      orderNumber: order.orderNumber,
      orderId: order.id,
      grandTotal: order.grandTotal,
      itemCount,
      deliveryName: data.deliveryName
    }).catch(() => undefined);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: summary.grandTotal,
      paymentStatus: paymentResult.status,
      paymentUrl: paymentResult.redirectUrl,
      items: data.cartItems.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
