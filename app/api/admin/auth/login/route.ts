import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminPassword, getExpectedAdminToken } from "@/lib/auth/admin-auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Incorrect admin password. Access denied." },
        { status: 401 }
      );
    }

    const token = getExpectedAdminToken();
    const cookieStore = await cookies();

    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days session
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to authenticate." },
      { status: 500 }
    );
  }
}
