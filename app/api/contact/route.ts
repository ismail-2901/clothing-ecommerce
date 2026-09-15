import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { sendContactEmail } from "@/lib/notifications/notification-service";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  message: z.string().min(10).max(5000)
});

export async function POST(request: NextRequest) {
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

  // Persist to audit log so admin can review all contact submissions
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "CONTACT_FORM_SUBMITTED",
      resource: "ContactForm",
      resourceId: null,
      previous: {},
      next: { name, email, message }
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
