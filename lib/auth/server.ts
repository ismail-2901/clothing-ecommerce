import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/db/prisma";
import type { RoleName, Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

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
