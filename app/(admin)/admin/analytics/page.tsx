export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { ShoppingCart, ArrowUpRight, Users, BarChart3, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

function subDays(days: number) {
  return new Date(Date.now() - days * 86400000);
}

export default async function AdminAnalyticsPage() {
  const session = await getServerSession();
  if (!session?.userId) redirect("/login");

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.userId },
    include: { role: true }
  });
  const isAdmin = userRoles.some((ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN");
  if (!isAdmin) redirect("/admin");

  // ─── DB aggregations (last 30 days) ───────────────────────
  const [
    revenueRows,
    totalCustomers,
    newCustomers,
    topProducts,
    statusBreakdown,
    cartEvents,
    checkoutEvents,
    orderEvents,
  ] = await Promise.all([
    // Revenue + order count by day (last 30 days, delivered orders)
    prisma.$queryRaw<Array<{ day: Date; revenue: bigint; orders: bigint }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        SUM("grandTotal")             AS revenue,
        COUNT(*)                      AS orders
      FROM "Order"
      WHERE "createdAt" >= ${subDays(30)}
        AND status NOT IN ('CANCELLED','FAILED_DELIVERY')
      GROUP BY day
      ORDER BY day ASC
    `,

    // Total customers
    prisma.user.count({ where: { deletedAt: null } }),

    // New customers last 30 days
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: subDays(30) } } }),

    // Top 5 products by units sold (last 30 days)
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, lineTotal: true },
      where: { order: { createdAt: { gte: subDays(30) }, status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    }).then(async (rows) => {
      const ids = rows.map((r) => r.productId);
      const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } });
      return rows.map((r) => ({
        product: products.find((p) => p.id === r.productId),
        units: r._sum.quantity ?? 0,
        revenue: r._sum.lineTotal ?? 0
      }));
    }),

    // Order status breakdown
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: subDays(30) } }
    }),

    // Conversion funnel from customer events
    prisma.customerEvent.count({ where: { type: "ADD_TO_CART", createdAt: { gte: subDays(30) } } }),
    prisma.customerEvent.count({ where: { type: "CHECKOUT_STARTED", createdAt: { gte: subDays(30) } } }),
    prisma.customerEvent.count({ where: { type: "ORDER_CREATED", createdAt: { gte: subDays(30) } } }),
  ]);

  // Derived totals
  const totalRevenue = revenueRows.reduce((s, r) => s + Number(r.revenue), 0);
  const totalOrders = revenueRows.reduce((s, r) => s + Number(r.orders), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const maxRevenue = Math.max(1, ...revenueRows.map((r) => Number(r.revenue)));

  // Last 7 days for chart (show recent bar data)
  const last7 = revenueRows.slice(-7);

  const funnelStages = [
    { stage: "Cart adds", count: cartEvents },
    { stage: "Checkout started", count: checkoutEvents },
    { stage: "Orders placed", count: orderEvents },
  ];
  const funnelMax = Math.max(1, funnelStages[0].count);

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days · live DB data</p>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue", value: formatMoney(totalRevenue), icon: ArrowUpRight },
          { label: "Orders", value: totalOrders, icon: ShoppingCart },
          { label: "Avg. order value", value: formatMoney(avgOrderValue), icon: BarChart3 },
          { label: "New customers", value: newCustomers, icon: Users, sub: `${totalCustomers} total` },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon size={18} className="text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue bar chart */}
        <div className="rounded-lg border border-border bg-background p-5 lg:col-span-2">
          <h2 className="font-semibold">Daily revenue</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Last 7 days with data</p>
          {last7.length === 0 ? (
            <div className="mt-8 flex h-32 items-center justify-center text-sm text-muted-foreground">
              No order data yet
            </div>
          ) : (
            <div className="mt-5 flex h-48 items-end gap-2">
              {last7.map((day) => {
                const rev = Number(day.revenue);
                const heightPct = Math.round((rev / maxRevenue) * 100);
                const label = new Date(day.day).toLocaleDateString("en-BD", { day: "numeric", month: "short" });
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <p className="text-[10px] text-muted-foreground">{formatMoney(rev)}</p>
                    <div
                      className="w-full rounded-t-sm bg-foreground transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`${label}: ${formatMoney(rev)}`}
                    />
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Order status</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-4 space-y-3">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{s.status.replace(/_/g, " ").toLowerCase()}</span>
                <span className="font-semibold">{s._count}</span>
              </div>
            ))}
            {statusBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Conversion funnel */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp size={16} /> Conversion funnel
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">From tracked customer events</p>
          <div className="mt-5 grid gap-3">
            {funnelStages.map((stage, i) => {
              const widthPct = Math.round((stage.count / funnelMax) * 100);
              const convRate = i > 0 && funnelStages[i - 1].count > 0
                ? `${Math.round((stage.count / funnelStages[i - 1].count) * 100)}% from prev`
                : "";
              return (
                <div key={stage.stage}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="font-semibold">
                      {stage.count.toLocaleString()}{" "}
                      {convRate && <span className="text-xs font-normal text-muted-foreground">({convRate})</span>}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Top products</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">By units sold (last 30 days)</p>
          <div className="mt-4 space-y-3">
            {topProducts.map(({ product, units, revenue }) => (
              <div key={product?.id ?? revenue} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{product?.name ?? "Unknown"}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span>{units} units</span>
                  <span className="font-semibold">{formatMoney(revenue)}</span>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
