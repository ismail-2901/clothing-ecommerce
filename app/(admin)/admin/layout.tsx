export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { getServerUser } from "@/lib/auth/server";
import { AdminLockScreen } from "@/components/admin/admin-lock-screen";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard – Elaris",
  robots: {
    index: false,
    follow: false
  }
};

// Derive the exact shape getServerUser() returns so we get full type safety.
type ServerUser = NonNullable<Awaited<ReturnType<typeof getServerUser>>>;

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  let user: ServerUser | null = null;
  let isBetterAuthAdmin = false;

  try {
    user = await getServerUser();
    isBetterAuthAdmin =
      user?.roles?.some(
        (ur: Prisma.UserRoleGetPayload<{ include: { role: true } }>) =>
          ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
      ) ?? false;
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("[AdminLayout] Error fetching server user:", err);
  }

  if (!isBetterAuthAdmin) {
    return <AdminLockScreen />;
  }

  const userInfo = {
    name: user?.name ?? "Administrator",
    email: user?.email ?? "admin@elaris.internal",
    image: user?.image ?? null
  };

  return <AdminShell user={userInfo}>{children}</AdminShell>;
}
