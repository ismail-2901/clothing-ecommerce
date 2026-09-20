import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { sendContactEmail } from "@/lib/notifications/notification-service";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  message: z.string().min(10).max(5000)
});

export async function POST(request: NextRequest) {
  // 5 submissions per 5 minutes per IP
  const ip = getClientIp(request as any);
  const rl = await rateLimiter.consume(`contact:${ip}`, 5, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many contact requests. Please wait before submitting again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { name, email, message } = parsed.data;

  // BUG-45 FIX: Omit sensitive customer PII (email, raw message) from permanent audit trail;
  // record only non-PII submission telemetry (domain, message length, timestamp)
  const emailDomain = email.split("@")[1] || "unknown";
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "CONTACT_FORM_SUBMITTED",
      resource: "ContactForm",
      resourceId: null,
      previous: {},
      next: {
        senderDomain: emailDomain,
        messageLength: message.length,
        submittedAt: new Date().toISOString()
      }
    }
  });

  // Send email notifications (non-fatal — submission already persisted)
  try {
    await sendContactEmail({ name, email, message });
  } catch (err) {
    console.error("[contact] email send failed:", err);
  }

  return NextResponse.json({ ok: true });
}
