export const dynamic = "force-dynamic";

import { ArrowUpRight, PackageCheck, ShieldAlert, ShoppingCart, Users, AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { prisma } from "@/db/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    orderStats,
    customerCount,
    pendingConfirmationCount,
    packedTodayCount,
    failedDeliveryCount,
    riskCount,
    lowStockVariants
  ] = await Promise.all([
    // Non-cancelled orders revenue & count
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
      _sum: { grandTotal: true },
      _count: { id: true }
    }),
    // Registered customers
    prisma.user.count({ where: { deletedAt: null } }),
    // Workload counts
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PACKED" } }),
    prisma.order.count({ where: { status: "FAILED_DELIVERY" } }),
    // Risk items
    prisma.riskAssessment.count({ where: { level: { in: ["HIGH", "CRITICAL"] } } }),
    // Low stock variants
    prisma.productVariant.findMany({
      where: { stockQuantity: { lte: 5 }, deletedAt: null },
      include: { product: { select: { name: true, slug: true } } },
      take: 6
    })
  ]);

  const totalRevenue = orderStats._sum.grandTotal ?? 0;
  const totalOrders = orderStats._count.id;

  const metrics = [
    {
      label: "Revenue",
      value: formatMoney(totalRevenue),
      icon: ArrowUpRight,
      hint: totalOrders > 0 ? "From confirmed & completed orders" : "No orders yet"
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      hint: `${pendingConfirmationCount} pending confirmation`
    },
    {
      label: "Active customers",
      value: customerCount.toLocaleString(),
      icon: Users,
      hint: "Registered store accounts"
    },
    {
      label: "Risk reviews",
      value: riskCount.toLocaleString(),
      icon: ShieldAlert,
      hint: riskCount > 0 ? "Requires manual review" : "All orders healthy"
    }
  ];

  const workloads = [
    { label: "Pending confirmation", count: pendingConfirmationCount, href: "/admin/orders" },
    { label: "Packed orders", count: packedTodayCount, href: "/admin/orders" },
    { label: "Failed delivery review", count: failedDeliveryCount, href: "/admin/orders" }
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Admin dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Live store data from database</p>
      </div>

      {/* Primary KPI cards */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-lg border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Icon aria-hidden="true" size={19} className="text-muted-foreground" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{metric.hint}</p>
            </article>
          );
        })}
      </section>

      {/* Workload and inventory alerts */}
      <section className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Order workload</h2>
            <Link href="/admin/orders" className="text-xs font-semibold underline underline-offset-4">
              View all orders
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {workloads.map(({ label, count, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between rounded-md border border-border p-4 hover:bg-muted/30 transition"
              >
                <span className="text-sm">{label}</span>
                <span className="text-sm font-semibold">{count}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Low stock alerts (≤5)</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold underline underline-offset-4">
              Manage inventory
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {lowStockVariants.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center rounded-md border border-dashed border-border p-4 text-center">
                <PackageCheck size={24} className="text-muted-foreground mb-1" />
                <p className="text-sm font-medium">All stock levels healthy</p>
                <p className="text-xs text-muted-foreground mt-0.5">No products currently below 5 units.</p>
              </div>
            ) : (
              lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border border-border p-4">
                  <div>
                    <span className="text-sm font-medium">{v.product.name}</span>
                    <p className="text-xs text-muted-foreground font-mono">
                      {v.color} / {v.size} ({v.sku})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-danger">
                      {v.stockQuantity} in stock
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
