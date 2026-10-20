import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request as any);
  const rl = await rateLimiter.consume(`newsletter:${ip}`, 5, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email address.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { email } = parsed.data;
  const emailDomain = email.split("@")[1] || "unknown";

  try {
    await prisma.auditLog.create({
      data: {
        actorId: null,
        action: "NEWSLETTER_SUBSCRIBED",
        resource: "Newsletter",
        resourceId: null,
        metadata: {
          emailDomain,
          subscribedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error("Failed to log newsletter subscription:", err);
  }

  return NextResponse.json({
    success: true,
    message: "Thank you for subscribing to ELARIS updates.",
  });
}
