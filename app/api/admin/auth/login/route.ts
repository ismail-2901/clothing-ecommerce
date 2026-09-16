import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/db/prisma";

/**
 * Admin login via Better Auth credential sign-in.
 * Requires a real user account with ADMIN or SUPER_ADMIN role in the database.
 * No hardcoded passwords. No master-password fallback. No admin_session cookie.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required." }, { status: 400 });
    }

    // Sign in via Better Auth (verifies credentials against hashed password in DB)
    const result = await auth.api.signInEmail({
      body: { email: email.trim().toLowerCase(), password },
      asResponse: true
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify the signed-in user actually has an admin role
    const normalised = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalised },
      include: { roles: { include: { role: true } } }
    });

    const hasAdminRole = user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    );

    if (!hasAdminRole) {
      // Sign out immediately — valid credentials but not an admin
      try {
        await auth.api.signOut({ headers: req.headers as any });
      } catch {
        // best effort
      }
      return NextResponse.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Forward the Set-Cookie headers from Better Auth to the client
    const setCookieHeader = result.headers.get("set-cookie");
    const response = NextResponse.json({ ok: true });
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }
    return response;
  } catch (err) {
    console.error("[admin:login]", err);
    return NextResponse.json(
      { error: "Failed to authenticate administrator." },
      { status: 500 }
    );
  }
}
