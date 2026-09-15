import { NextResponse } from "next/server";
import { getClientIp, processVerifyOtp } from "@/lib/auth/otp";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const ip = getClientIp(req);
    const result = await processVerifyOtp(email, code, ip);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
