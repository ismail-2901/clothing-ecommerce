import type { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/auth";

export interface TestAuthResult {
  user: { id: string; email: string; name: string };
  cookieHeader: string;
  sessionToken: string;
  headers: Headers;
}

export async function createAuthenticatedUser(
  db: PrismaClient,
  options: {
    role?: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
    email?: string;
    name?: string;
  } = {}
): Promise<TestAuthResult> {
  const roleName = options.role ?? "CUSTOMER";
  const uniqueId = Math.random().toString(36).slice(2, 9);
  const email = options.email ?? `${roleName.toLowerCase()}-${uniqueId}@example.com`;
  const name = options.name ?? `${roleName} User`;
  const password = "SecureTestPassword123!";

  // 1. Sign up through Better Auth
  const signUpRes = await auth.api.signUpEmail({
    body: { email, password, name }
  });

  const userId = signUpRes.user.id;

  // 2. Mark email verified in DB
  await db.user.update({
    where: { id: userId },
    data: { emailVerified: true }
  });

  // 3. Assign role in PostgreSQL
  if (roleName === "ADMIN" || roleName === "SUPER_ADMIN") {
    const role = await db.role.upsert({
      where: { name: roleName },
      create: { name: roleName, description: `${roleName} Role` },
      update: {}
    });

    await db.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id
        }
      },
      create: {
        userId,
        roleId: role.id
      },
      update: {}
    });
  }

  // 4. Sign in to obtain authoritative Better Auth session cookie
  const signInRes = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true
  });

  const setCookie = signInRes.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
  const sessionToken = match ? match[1] : "";

  const headers = new Headers({
    cookie: setCookie,
    "content-type": "application/json"
  });

  return {
    user: { id: userId, email, name },
    cookieHeader: setCookie,
    sessionToken,
    headers
  };
}
