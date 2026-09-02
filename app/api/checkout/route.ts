import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCartTotals } from "@/features/pricing/pricing";
import { generateOrderNumber } from "@/features/orders/order-service";
import { getPaymentProvider } from "@/lib/payments/providers";
import { storeConfig } from "@/config/store";

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().trim().min(7),
  deliveryName: z.string().trim().min(2),
  deliveryLine1: z.string().trim().min(5),
  deliveryLine2: z.string().trim().optional(),
  deliveryCity: z.string().trim().min(2),
  deliveryArea: z.string().trim().optional(),
  deliveryPostalCode: z.string().trim().optional(),
  deliveryCountry: z.string().length(2).default("BD"),
  paymentProvider: z.enum(["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"]),
  cartItems: z.array(
    z.object({
      sku: z.string(),
      productId: z.string(),
      name: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().int().min(0)
    })
  ),
  couponCode: z.string().optional()
});

type CheckoutRequest = z.infer<typeof checkoutSchema>;

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout request." },
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
          value: 10
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

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      orderNumber,
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
