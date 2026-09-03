import Link from "next/link";
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
  Users
} from "lucide-react";
import { storeConfig } from "@/config/store";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { AdminLockScreen } from "@/components/admin/admin-lock-screen";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: Gauge, href: "/admin" },
    ]
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", icon: ClipboardList, href: "/admin/orders" },
      { label: "Products", icon: PackageSearch, href: "/admin/products" },
      { label: "Inventory", icon: Boxes, href: "/admin/inventory" },
      { label: "Categories", icon: LayoutGrid, href: "/admin/categories" },
      { label: "Offers", icon: Megaphone, href: "/admin/offers" },
    ]
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", icon: Users, href: "/admin/customers" },
      { label: "Abandoned Carts", icon: ShoppingCart, href: "/admin/abandoned-checkouts" },
      { label: "Reviews", icon: Star, href: "/admin/reviews" },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { label: "Risk Center", icon: ShieldAlert, href: "/admin/risk" },
      { label: "Analytics", icon: ChartNoAxesCombined, href: "/admin/analytics" },
    ]
  },
  {
    label: "System",
    items: [
      { label: "Content", icon: FileText, href: "/admin/content" },
      { label: "Notifications", icon: ScrollText, href: "/admin/notifications" },
      { label: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs" },
      { label: "Admins", icon: Users, href: "/admin/admins" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
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
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto border-r border-border bg-background p-5 lg:block">
        <Link href="/admin" className="text-lg font-semibold">
          {storeConfig.name}
        </Link>
        <p className="text-xs text-muted-foreground">Admin</p>
        <div className="mt-6 grid gap-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {group.label}
              </p>
              <nav className="grid gap-0.5">
                {group.items.map(({ label, icon: Icon, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  >
                    <Icon aria-hidden="true" size={16} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-4 grid gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            ← Storefront
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="lg:pl-60">
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4 lg:hidden">
          <Link href="/admin" className="font-semibold">
            {storeConfig.name} Admin
          </Link>
          <div className="w-32">
            <AdminLogoutButton />
          </div>
        </div>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
