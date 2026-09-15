import crypto from "node:crypto";
import { auth } from "@/lib/auth/auth";
import { headers, cookies } from "next/headers";
import { prisma } from "@/db/prisma";
import type { RoleName, Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export function getExpectedAdminToken(): string {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "elaris-admin-secret-salt-2026";
  return crypto
    .createHmac("sha256", secret)
    .update("admin_verified_session")
    .digest("hex");
}

export function isValidAdminSession(token?: string | null): boolean {
  if (!token) return false;
  const expected = getExpectedAdminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/**
 * Get the current Better Auth session server-side.
 * Returns null if unauthenticated.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.session ?? null;
}

/**
 * Get session or throw for protected routes.
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

/**
 * Returns the authenticated user with their roles, or null.
 */
export async function getServerUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: { include: { role: true } }
    }
  });
  return user;
}

/**
 * Asserts that the current session belongs to an ADMIN or SUPER_ADMIN.
 * Recognizes both Better Auth admin sessions and master admin cookie sessions.
 * Optionally checks a specific permission.
 *
 * On success returns { userId, role }.
 * On failure returns a NextResponse 401/403 — callers must return it immediately.
 */
export async function requireAdminSession(
  permission?: Permission
): Promise<
  | { ok: true; userId: string; role: RoleName }
  | { ok: false; response: NextResponse }
> {
  // 1. Check master admin session cookie first (fail-safe for owner)
  const cookieStore = await cookies();
  const masterCookie = cookieStore.get("admin_session")?.value;
  if (isValidAdminSession(masterCookie)) {
    return { ok: true, userId: "master-admin", role: "SUPER_ADMIN" as RoleName };
  }

  // 2. Check standard Better Auth session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.user.id },
    include: { role: true }
  });

  const adminRole = userRoles.find(
    (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
  );

  if (!adminRole) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  const role = adminRole.role.name as RoleName;

  if (permission && !hasPermission(role, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Missing permission: ${permission}` },
        { status: 403 }
      )
    };
  }

  return { ok: true, userId: session.user.id, role };
}
