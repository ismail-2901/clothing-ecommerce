import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
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
  Search,
  Bell,
  UserCheck,
  Radio
} from "lucide-react";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { AdminLockScreen } from "@/components/admin/admin-lock-screen";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNotificationBell, AdminNotificationNavBadge } from "@/components/admin/admin-notification-bell";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: Gauge, href: "/admin" },
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
    ]
  },
  {
    label: "CUSTOMERS",
    items: [
      { label: "Customers", icon: Users, href: "/admin/customers" },
      { label: "Abandoned Carts", icon: ShoppingCart, href: "/admin/abandoned-checkouts" },
      { label: "Reviews", icon: Star, href: "/admin/reviews" },
    ]
  },
  {
    label: "CONTENT",
    items: [
      { label: "Content", icon: FileText, href: "/admin/content" },
    ]
  },
  {
    label: "INTELLIGENCE",
    items: [
      { label: "Risk Center", icon: ShieldAlert, href: "/admin/risk" },
      { label: "Analytics", icon: ChartNoAxesCombined, href: "/admin/analytics" },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Settings", icon: Settings, href: "/admin/settings" },
      { label: "Notifications", icon: Bell, href: "/admin/notifications" },
      { label: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs" },
      { label: "Admins", icon: UserCheck, href: "/admin/admins" },
    ]
  }
] as const;

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const isAuthenticated = isValidAdminSession(token);

  if (!isAuthenticated) {
    return <AdminLockScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-50/50 text-foreground flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-y-auto border-r border-border/80 bg-background p-5 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="px-2">
            <Link href="/admin" className="block text-2xl font-black tracking-[0.16em] uppercase text-foreground">
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
                  {group.items.map(({ label, icon: Icon, href }: any) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{label}</span>
                      </div>
                      {href === "/admin/notifications" && <AdminNotificationNavBadge />}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Grow Your Brand Card + Logout */}
        <div className="mt-8 space-y-4 pt-4 border-t border-border/60">
          {/* Grow Your Brand Promo Card */}
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
            <Link href="/" className="font-semibold text-muted-foreground hover:text-foreground">
              ← Storefront
            </Link>
            <div className="w-24">
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Header */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur px-6 lg:px-8">
          {/* Global Search Bar */}
          <div className="relative w-72 sm:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="h-9 w-full rounded-md border border-border/80 bg-muted/30 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-all"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Real-Time Notification Bell with Badge */}
            <AdminNotificationBell />

            {/* Admin Profile & Security Link */}
            <Link
              href="/admin/settings?tab=security"
              className="flex items-center gap-3 border-l border-border/80 pl-4 hover:opacity-80 transition-opacity group cursor-pointer"
              title="Admin Security & Password Settings"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-muted shrink-0 group-hover:border-foreground transition-colors">
                <Image src="/elaris-women.jpg" alt="Admin" fill className="object-cover" sizes="36px" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-foreground leading-tight group-hover:underline">Admin</p>
                <p className="text-[10px] text-muted-foreground leading-tight">admin@elaris.com</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
