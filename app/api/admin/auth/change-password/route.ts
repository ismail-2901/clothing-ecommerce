import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requireAdminSession } from "@/lib/auth/server";

export async function POST(req: Request) {
  try {
    const authSession = await requireAdminSession();
    if (!authSession.ok) {
      return authSession.response;
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
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

    const reqHeaders = await headers();
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      },
      headers: reqHeaders
    });

    return NextResponse.json({
      ok: true,
      message: "Admin password updated successfully."
    });
  } catch (error: any) {
    console.error("[admin:change-password]", error);
    const message =
      error?.message || error?.body?.message || "Failed to update admin password.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
