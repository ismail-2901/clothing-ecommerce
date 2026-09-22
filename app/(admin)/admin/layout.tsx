export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getServerUser } from "@/lib/auth/server";
import { AdminLockScreen } from "@/components/admin/admin-lock-screen";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";
import { AdminDesktopSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  let user: any = null;
  let isBetterAuthAdmin = false;

  try {
    user = await getServerUser();
    isBetterAuthAdmin =
      user?.roles?.some(
        (ur: any) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
      ) ?? false;
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("[AdminLayout] Error fetching server user:", err);
  }

  if (!isBetterAuthAdmin) {
    return <AdminLockScreen />;
  }

  const userInfo = {
    name: user?.name ?? "Administrator",
    email: user?.email ?? "admin@elaris.internal"
  };

  return (
    <div className="min-h-screen bg-stone-50/50 text-foreground flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop sidebar (lg+) */}
      <AdminDesktopSidebar user={userInfo} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 max-w-full">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur px-4 lg:px-8">
          {/* Mobile: hamburger + brand | Desktop: search bar */}
          <div className="flex items-center gap-3">
            {/* Mobile drawer trigger (rendered inside AdminMobileNav) */}
            <AdminMobileNav user={userInfo} />

            {/* Brand wordmark on mobile only */}
            <Link
              href="/admin"
              className="text-lg font-black tracking-[0.14em] uppercase text-foreground lg:hidden"
            >
              ELARIS
            </Link>

            {/* Search — hidden on small screens */}
            <div className="relative hidden sm:block w-64 lg:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="h-9 w-full rounded-md border border-border/80 bg-muted/30 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-Time Notification Bell with Badge */}
            <AdminNotificationBell />

            {/* Admin Profile & Security Link */}
            <Link
              href="/admin/settings?tab=security"
              className="flex items-center gap-2.5 sm:gap-3 border-l border-border/80 pl-3 sm:pl-4 hover:opacity-80 transition-opacity group cursor-pointer"
              title="Admin Security & Password Settings"
            >
              <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-border bg-muted shrink-0 group-hover:border-foreground transition-colors">
                <Image src="/elaris-women.jpg" alt="Admin" fill className="object-cover" sizes="36px" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-tight group-hover:underline">{userInfo.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{userInfo.email}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
