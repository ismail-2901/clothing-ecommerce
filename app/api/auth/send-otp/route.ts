import { NextResponse } from "next/server";
import { getClientIp, processSendOtp } from "@/lib/auth/otp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const ip = getClientIp(req);
    const result = await processSendOtp(email, ip);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send code." }, { status: 500 });
  }
}
