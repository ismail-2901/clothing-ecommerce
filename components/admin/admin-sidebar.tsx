"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Gauge,
  LayoutGrid,
  Megaphone,
  PackageSearch,
  ScrollText,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Star,
  Users,
  Bell,
  UserCheck,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { AdminNotificationNavBadge } from "@/components/admin/admin-notification-bell";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

export const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: Gauge, href: "/admin" }
    ]
  },
  {
    label: "COMMERCE",
    items: [
      { label: "Orders", icon: ClipboardList, href: "/admin/orders" },
      { label: "Products", icon: PackageSearch, href: "/admin/products" },
      { label: "Inventory", icon: Boxes, href: "/admin/inventory" },
      { label: "Categories", icon: LayoutGrid, href: "/admin/categories" },
      { label: "Offers", icon: Megaphone, href: "/admin/offers" }
    ]
  },
  {
    label: "CUSTOMERS",
    items: [
      { label: "Customers", icon: Users, href: "/admin/customers" },
      { label: "Abandoned Carts", icon: ShoppingCart, href: "/admin/abandoned-checkouts" },
      { label: "Reviews", icon: Star, href: "/admin/reviews" }
    ]
  },
  {
    label: "INTELLIGENCE",
    items: [
      { label: "Risk Center", icon: ShieldAlert, href: "/admin/risk" },
      { label: "Analytics", icon: ChartNoAxesCombined, href: "/admin/analytics" }
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Settings", icon: Settings, href: "/admin/settings" },
      { label: "Notifications", icon: Bell, href: "/admin/notifications" },
      { label: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs" },
      { label: "Admins", icon: UserCheck, href: "/admin/admins" }
    ]
  }
] as const;

type UserInfo = { name?: string | null; email?: string | null };

function SidebarInner({ user, onNavClick }: { user: UserInfo; onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2">
          <Link
            href="/admin"
            onClick={onNavClick}
            className="block text-2xl font-black tracking-[0.16em] uppercase text-foreground"
          >
            ELARIS
          </Link>
          <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            ADMIN PANEL
          </p>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                {group.label}
              </p>
              <nav className="space-y-0.5">
                {group.items.map(({ label, icon: Icon, href }) => {
                  const isActive =
                    href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavClick}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{label}</span>
                      </div>
                      {href === "/admin/notifications" && <AdminNotificationNavBadge />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-8 space-y-4 pt-4 border-t border-border/60">
        <div className="relative overflow-hidden rounded-xl border border-border bg-stone-100 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-serif italic text-base leading-tight text-foreground">
              Grow<br />Your Brand
            </p>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase pt-1">
              ELARIS ADMIN
            </p>
          </div>
          <div className="relative h-16 w-14 rounded-lg overflow-hidden shrink-0">
            <Image src="/elaris-women.jpg" alt="Admin Promotion" fill className="object-cover" sizes="56px" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            href="/"
            onClick={onNavClick}
            className="font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Storefront
          </Link>
          <div className="w-24">
            <AdminLogoutButton />
          </div>
        </div>

        {/* User info at bottom */}
        <div className="flex items-center gap-2.5 px-1 pt-1 border-t border-border/40">
          <div className="relative h-7 w-7 overflow-hidden rounded-full border border-border bg-muted shrink-0">
            <Image src="/elaris-women.jpg" alt="Admin" fill className="object-cover" sizes="28px" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{user.name ?? "Admin"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Desktop sidebar (always visible lg+) ── */
export function AdminDesktopSidebar({ user }: { user: UserInfo }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-y-auto border-r border-border/80 bg-background p-5 lg:flex lg:flex-col">
      <SidebarInner user={user} />
    </aside>
  );
}

/* ── Mobile drawer ── */
export function AdminMobileNav({ user }: { user: UserInfo }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger — visible below lg */}
      <button
        id="admin-mobile-nav-trigger"
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <aside
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border/80 bg-background p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <SidebarInner user={user} onNavClick={() => setOpen(false)} />
      </aside>
    </>
  );
}
