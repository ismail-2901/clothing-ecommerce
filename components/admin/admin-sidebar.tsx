"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
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
  Menu,
  X,
  ImagePlay,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight
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
      { label: "Offers", icon: Megaphone, href: "/admin/offers" },
      { label: "Hero Slides", icon: ImagePlay, href: "/admin/hero-slides" }
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

export type UserInfo = { name?: string | null; email?: string | null; image?: string | null };

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "AD";
}

function SidebarInner({
  user,
  onNavClick,
  isMobileDrawer = false,
  isCollapsed = false,
  onToggleCollapse
}: {
  user: UserInfo;
  onNavClick?: () => void;
  isMobileDrawer?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between min-h-full pb-4">
      <div className="space-y-5">
        {/* Brand Header */}
        {!isMobileDrawer && (
          <div className="flex items-center justify-between px-1 pt-1 pb-2 border-b border-border/60">
            {isCollapsed ? (
              <Link
                href="/admin"
                onClick={onNavClick}
                className="flex h-9 w-9 mx-auto items-center justify-center rounded-lg bg-stone-900 text-white font-black text-sm tracking-widest shadow-xs hover:bg-stone-800 transition-colors"
                title="ELARIS Admin"
              >
                E
              </Link>
            ) : (
              <div className="min-w-0">
                <Link
                  href="/admin"
                  onClick={onNavClick}
                  className="block text-xl font-black tracking-[0.16em] uppercase text-foreground leading-none"
                >
                  ELARIS
                </Link>
                <p className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase pt-1">
                  ADMIN CONTROL
                </p>
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className={`hidden lg:flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-stone-100 hover:text-foreground transition-all cursor-pointer ${
                  isCollapsed ? "mx-auto mt-2" : ""
                }`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
          </div>
        )}

        {/* Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                  {group.label}
                </p>
              ) : (
                <div className="mx-2 my-2 border-t border-border/60" aria-hidden="true" />
              )}

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
                      title={isCollapsed ? label : undefined}
                      aria-label={label}
                      className={`relative flex items-center rounded-lg transition-all ${
                        isCollapsed
                          ? `h-10 w-10 mx-auto justify-center ${
                              isActive
                                ? "bg-stone-900 text-white shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-500 before:rounded-r"
                                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            }`
                          : `justify-between px-3 py-2 text-xs font-medium ${
                              isActive
                                ? "bg-stone-900 text-white shadow-2xs font-semibold"
                                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                            }`
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        <Icon size={isCollapsed ? 18 : 16} className="shrink-0" />
                        {!isCollapsed && <span className="truncate">{label}</span>}
                      </div>

                      {href === "/admin/notifications" && (
                        isCollapsed ? (
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        ) : (
                          <AdminNotificationNavBadge />
                        )
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className={`mt-6 pt-3 border-t border-border/60 ${isCollapsed ? "space-y-3" : "space-y-3.5"}`}>
        {/* Promotional Banner (Expanded only) */}
        {!isCollapsed && !isMobileDrawer && (
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-stone-100/70 p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-serif italic text-sm font-medium leading-tight text-foreground">
                Grow<br />Your Brand
              </p>
              <p className="text-[8.5px] font-bold tracking-widest text-muted-foreground uppercase pt-1">
                ELARIS ADMIN
              </p>
            </div>
            <div className="relative h-14 w-12 rounded-lg overflow-hidden shrink-0 border border-border/40">
              <Image
                src="/elaris-women.jpg"
                alt="Storefront"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          </div>
        )}

        {/* Quick Actions Row */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              onClick={onNavClick}
              title="Visit Storefront"
              aria-label="Visit Storefront"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-foreground transition-colors"
            >
              <ArrowUpRight size={16} />
            </Link>
            <AdminLogoutButton compact />
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs px-1">
            <Link
              href="/"
              onClick={onNavClick}
              className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>← Storefront</span>
            </Link>
            <div className="w-24">
              <AdminLogoutButton />
            </div>
          </div>
        )}

        {/* User Card */}
        <div
          className={`flex items-center border-t border-border/40 pt-2.5 ${
            isCollapsed ? "justify-center" : "gap-2.5 px-1"
          }`}
          title={`${user.name ?? "Administrator"} (${user.email ?? "admin@elaris.internal"})`}
        >
          <div className="relative h-7 w-7 overflow-hidden rounded-full border border-border bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 shadow-2xs">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Admin"}
                fill
                className="object-cover"
                sizes="28px"
              />
            ) : (
              <span className="text-[10px] font-bold tracking-tight">
                {getInitials(user.name, user.email)}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {user.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop sidebar (always visible lg+) ── */
export function AdminDesktopSidebar({
  user,
  isCollapsed = false,
  onToggleCollapse
}: {
  user: UserInfo;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 hidden overflow-y-auto border-r border-border/80 bg-white transition-[width] duration-300 ease-in-out lg:flex lg:flex-col ${
        isCollapsed ? "w-[72px] p-3" : "w-64 p-4"
      }`}
    >
      <SidebarInner
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}

/* ── Mobile drawer ── */
export function AdminMobileNav({ user }: { user: UserInfo }) {
  const [open, setOpen] = useState(false);
  const [mounted] = useState(() => typeof window !== "undefined");
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[9999] lg:hidden transition-[visibility] duration-300 ${
        open ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <aside
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-[10000] w-72 sm:w-80 max-w-[85vw] h-[100dvh] overflow-y-auto overscroll-contain border-r border-border/80 bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header inside Drawer with Brand & Close Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <div>
            <span className="block text-xl font-black tracking-[0.16em] uppercase text-foreground">
              ELARIS
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              ADMIN CONTROL
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-stone-100 hover:text-foreground active:scale-95 transition-all cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <SidebarInner user={user} onNavClick={() => setOpen(false)} isMobileDrawer />
      </aside>
    </div>
  );

  return (
    <>
      {/* Hamburger trigger — visible below lg */}
      <button
        id="admin-mobile-nav-trigger"
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-foreground hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
      >
        <Menu size={22} className="stroke-[2.2]" />
      </button>

      {/* Render drawer at body level via portal to avoid stacking context issues */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
