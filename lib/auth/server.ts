import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import type { Session } from "better-auth";

/**
 * Get the current session server-side.
 * Returns null if unauthenticated.
 */
export async function getServerSession(): Promise<Session | null> {
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
