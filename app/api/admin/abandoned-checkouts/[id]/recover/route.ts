import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { sendAbandonedCheckoutRecoveryEmail } from "@/lib/notifications/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: { force?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  const checkout = await prisma.abandonedCheckout.findUnique({
    where: { id },
    include: {
      cart: {
        include: {
          items: {
            include: {
              variant: {
                include: { product: { select: { name: true } } }
              }
            }
          },
          user: { select: { name: true, email: true } }
        }
      }
    }
  });

  if (!checkout) {
    return NextResponse.json({ error: "Abandoned checkout session not found." }, { status: 404 });
  }

  // Extract recipient
  const rawMeta = (checkout.metadata as Record<string, any>) || {};
  const recipientEmail = checkout.cart?.user?.email || rawMeta.guestEmail || rawMeta.email || null;
  const customerName = checkout.cart?.user?.name || rawMeta.customerName || "Customer";

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return NextResponse.json(
      {
        error: "No recipient email address associated with this session. Recovery dispatch requires a valid email.",
        channel: "EMAIL",
        status: "UNAVAILABLE"
      },
      { status: 400 }
    );
  }

  // Duplicate check: within 24 hours
  if (rawMeta.lastRecoverySentAt && !body.force) {
    const lastSentTime = new Date(rawMeta.lastRecoverySentAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - lastSentTime < twentyFourHours) {
      return NextResponse.json(
        {
          error: "A recovery message was already dispatched to this customer in the last 24 hours.",
          lastSent: rawMeta.lastRecoverySentAt,
          canForce: true
        },
        { status: 409 }
      );
    }
  }

  const items = (checkout.cart?.items ?? []).map((i) => ({
    name: i.variant.product.name,
    variant: `${i.variant.color} / ${i.variant.size}`,
    quantity: i.quantity
  }));

  // Dispatch genuine email
  try {
    await sendAbandonedCheckoutRecoveryEmail({
      to: recipientEmail,
      customerName,
      cartValue: checkout.cartValue,
      items: items.length > 0 ? items : [{ name: "Elaris Minimalist Garment", quantity: 1 }]
    });
  } catch (err: any) {
    console.error("[AbandonedRecovery] Email provider dispatch failed:", err);
    return NextResponse.json(
      {
        error: `Email provider dispatch failed: ${err.message || "Upstream provider error"}`,
        providerConfigured: process.env.EMAIL_PROVIDER ?? "console"
      },
      { status: 502 }
    );
  }

  const nowIso = new Date().toISOString();
  const pastAttempts = Array.isArray(rawMeta.recoveryAttempts) ? rawMeta.recoveryAttempts : [];
  const updatedAttempts = [
    ...pastAttempts,
    {
      dispatchedAt: nowIso,
      channel: "EMAIL",
      status: "SENT",
      actorId: auth.userId,
      recipient: recipientEmail
    }
  ];

  const updatedMeta = {
    ...rawMeta,
    lastRecoverySentAt: nowIso,
    recoveryAttempts: updatedAttempts,
    recoveryStatus: "SENT"
  };

  await prisma.abandonedCheckout.update({
    where: { id },
    data: {
      metadata: updatedMeta,
      updatedAt: new Date()
    }
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "ABANDONED_CHECKOUT_RECOVERY_SENT",
      resource: "AbandonedCheckout",
      resourceId: checkout.id,
      metadata: {
        cartId: checkout.cartId,
        recipient: recipientEmail,
        channel: "EMAIL",
        cartValueMinor: checkout.cartValue,
        stage: checkout.stage
      }
    }
  });

  return NextResponse.json({
    ok: true,
    dispatchedAt: nowIso,
    channel: "EMAIL",
    recipient: recipientEmail,
    attemptCount: updatedAttempts.length
  });
}

