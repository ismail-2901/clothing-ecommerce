import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/providers";
import { prisma } from "@/db/prisma";

// GET /api/payments/verify?provider=SSLCOMMERZ&tran_id=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "COD";
  const reference = searchParams.get("tran_id") || searchParams.get("reference") || searchParams.get("val_id") || "";
  const orderId = searchParams.get("orderId");

  if (!reference && !orderId) {
    return NextResponse.redirect(new URL("/checkout?error=missing_reference", request.url));
  }

  let providerInstance;
  try {
    providerInstance = getPaymentProvider(provider);
  } catch {
    return NextResponse.redirect(new URL("/checkout?error=unsupported_provider", request.url));
  }

  let paymentStatus;
  try {
    paymentStatus = await providerInstance.verifyPayment(reference);
  } catch (err) {
    return NextResponse.redirect(new URL("/checkout?error=verification_failed", request.url));
  }

  // Find payment and order
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(reference ? [{ providerPaymentId: reference }] : []),
        ...(orderId ? [{ orderId }] : [])
      ]
    },
    include: { order: true }
  });

  if (!payment) {
    return NextResponse.redirect(new URL("/checkout?error=order_not_found", request.url));
  }

  if (paymentStatus.status === "PAID" || paymentStatus.status === "AUTHORIZED") {
    // Task 019: validate amount and order identity before committing PAID
    if (
      paymentStatus.amount &&
      paymentStatus.amount > 0 &&
      Math.abs(paymentStatus.amount - payment.amount) > 1 // allow 1 paisa rounding tolerance
    ) {
      console.warn(
        `[payments/verify] Amount mismatch for ref=${reference}: provider reported ${paymentStatus.amount}, stored ${payment.amount}. Rejecting.`
      );
      return NextResponse.redirect(new URL("/checkout?error=payment_amount_mismatch", request.url));
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "PAID" }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
          ...(payment.order.status === "PENDING" ? { status: "CONFIRMED" } : {})
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          previousStatus: payment.order.status,
          newStatus: "CONFIRMED",
          note: `Payment verified via ${provider.toUpperCase()}. Ref: ${reference}`
        }
      });
    });

    const successUrl = new URL(`/checkout/success`, request.url);
    successUrl.searchParams.set("orderId", payment.orderId);
    successUrl.searchParams.set("total", String(payment.amount));
    if (payment.order.deliveryAddress && typeof payment.order.deliveryAddress === "object") {
      const addr = payment.order.deliveryAddress as { name?: string };
      if (addr.name) successUrl.searchParams.set("name", addr.name);
    }
    return NextResponse.redirect(successUrl);
  }


  return NextResponse.redirect(new URL(`/checkout?error=payment_${paymentStatus.status.toLowerCase()}`, request.url));
}
