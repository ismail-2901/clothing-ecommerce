import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code || typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Email and code required." }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    const user = await prisma.user.findUnique({ where: { email: normalised } });

    if (!user || !user.verificationCode || !user.verificationExpires) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }
    if (user.verificationExpires < new Date()) {
      return NextResponse.json({ error: "Code has expired. Request a new one." }, { status: 400 });
    }
    if (user.verificationCode !== trimmedCode) {
      return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: normalised },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null
      }
    });

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
