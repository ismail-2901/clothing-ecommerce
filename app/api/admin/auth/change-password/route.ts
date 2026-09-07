import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isValidAdminSession,
  verifyAdminPassword,
  setAdminPassword,
  getExpectedAdminToken
} from "@/lib/auth/admin-auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!isValidAdminSession(token)) {
      return NextResponse.json(
        { error: "Unauthorized administrative access. Please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password does not match our records." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password." },
        { status: 400 }
      );
    }

    // Persist new password with secure salt & HMAC hash in database
    await setAdminPassword(newPassword);

    // Refresh admin session token
    const newToken = getExpectedAdminToken();
    cookieStore.set("admin_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      ok: true,
      message: "Admin password updated successfully."
    });
  } catch (error) {
    console.error("[admin:change-password]", error);
    return NextResponse.json(
      { error: "Failed to update admin password. Please try again." },
      { status: 500 }
    );
  }
}
