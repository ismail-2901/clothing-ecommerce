import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function POST() {
  try {
    const reqHeaders = await headers();
    await auth.api.signOut({ headers: reqHeaders });
  } catch (err) {
    console.error("[admin:logout]", err);
  }

  return NextResponse.json({ ok: true });
}
