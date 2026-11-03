"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminDesktopSidebar, AdminMobileNav, type UserInfo } from "@/components/admin/admin-sidebar";
import { AdminHeaderSearch } from "@/components/admin/admin-header-search";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";

export function AdminShell({
  user,
  children
}: {
  user: UserInfo;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("elaris_admin_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("elaris_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage write errors
      }
      return next;
    });
  };

  const initials = (user.name || "AD")
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <div className="min-h-screen bg-[var(--admin-bg,#f9fafb)] text-[var(--admin-text-primary,#111827)] flex flex-col lg:flex-row overflow-x-hidden antialiased">
      {/* Desktop Collapsible Sidebar */}
      <AdminDesktopSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area with Adaptive Padding */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[var(--admin-border,#e5e7eb)] bg-white/95 backdrop-blur px-4 lg:px-8 shadow-xs">
          {/* Mobile hamburger + brand | Search Bar */}
          <div className="flex items-center gap-3">
            <AdminMobileNav user={user} />

            <Link
              href="/admin"
              className="text-lg font-black tracking-[0.14em] uppercase text-foreground lg:hidden"
            >
              ELARIS
            </Link>

            <AdminHeaderSearch />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <AdminNotificationBell />

            <Link
              href="/admin/settings?tab=security"
              className="flex items-center gap-2.5 sm:gap-3 border-l border-[var(--admin-border,#e5e7eb)] pl-3 sm:pl-4 hover:opacity-85 transition-opacity group cursor-pointer"
              title="Admin Security & Password Settings"
            >
              <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-[var(--admin-border,#e5e7eb)] bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 group-hover:border-foreground transition-colors shadow-2xs">
                {user.image ? (
                  <Image src={user.image} alt="Admin" fill className="object-cover" sizes="36px" />
                ) : (
                  <span className="text-xs font-bold tracking-tight">{initials}</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-tight group-hover:underline">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {user.email}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
