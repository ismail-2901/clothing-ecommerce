import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { buildOtpEmail } from "@/lib/email/otp-template";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required." }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalised } });
    if (!user) {
      // Don't reveal user existence — return 200 silently
      return NextResponse.json({ ok: true });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }

    // Rate-limit: block resend if existing code was issued < 60 s ago
    if (
      user.verificationExpires &&
      user.verificationCode &&
      user.verificationExpires.getTime() - 14 * 60 * 1000 > Date.now() - 60_000
    ) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another code." },
        { status: 429 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email: normalised },
      data: { verificationCode: code, verificationExpires: expires }
    });

    const { subject, html, text } = buildOtpEmail(code);
    await sendBrevoEmail({ to: normalised, subject, html, text });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send code." }, { status: 500 });
  }
}
