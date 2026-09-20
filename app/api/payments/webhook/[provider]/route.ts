import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/providers";
import { WebhookVerificationError } from "@/lib/payments/payment-provider";
import { prisma } from "@/db/prisma";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;

  let providerInstance;
  try {
    providerInstance = getPaymentProvider(provider);
  } catch {
    return NextResponse.json({ error: `Unknown payment provider: ${provider}` }, { status: 400 });
  }

  // ------------------------------------------------------------------
  // BUG-21 FIX: Verify webhook authenticity BEFORE parsing or trusting
  // the payload. Returns 401 so the gateway knows to retry with correct
  // credentials rather than silently dropping the event.
  // ------------------------------------------------------------------
  try {
    // For signature-based verification we need the raw body; pass the
    // request object's Headers so the provider can read X-Webhook-Secret,
    // Authorization, or provider-specific signature headers.
    await providerInstance.verifyWebhookSignature(undefined, request.headers);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error(`[webhook:${provider}] Signature verification failed:`, err.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  let payload: unknown;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const obj: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        obj[key] = value;
      });
      payload = obj;
    } else {
      payload = await request.text();
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse webhook payload" }, { status: 400 });
  }

  let webhookResult;
  try {
    webhookResult = await providerInstance.webhook(payload, request.headers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Authoritative server-side status update in database
  if (webhookResult.reference) {
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { providerPaymentId: webhookResult.reference },
            ...(webhookResult.orderId ? [{ orderId: webhookResult.orderId }] : [])
          ]
        },
        include: { order: true }
      });

      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: webhookResult.status,
              metadata: {
                ...(typeof payment.metadata === "object" && payment.metadata ? payment.metadata : {}),
                webhookPayload: JSON.parse(JSON.stringify(payload ?? {})),
                webhookAt: new Date().toISOString()
              }
            }
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: webhookResult.status,
              ...(webhookResult.status === "PAID" && payment.order.status === "PENDING"
                ? { status: "CONFIRMED" }
                : {})
            }
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              previousStatus: payment.order.status,
              newStatus: webhookResult.status === "PAID" ? "CONFIRMED" : payment.order.status,
              note: `Payment webhook verified: ${provider.toUpperCase()} marked as ${webhookResult.status}. Ref: ${webhookResult.reference}`
            }
          });
        });
      }
    } catch (err) {
      console.error("Failed to update database from payment webhook:", err);
      return NextResponse.json({ error: "Database update error" }, { status: 500 });
    }
  }

  return NextResponse.json({
    received: true,
    provider: providerInstance.code,
    reference: webhookResult.reference,
    status: webhookResult.status
  });
}
