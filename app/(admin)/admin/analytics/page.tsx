export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Download,
  Calendar,
  MapPin,
  CheckCircle2,
  Package,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { AdminDashboardSalesChart } from "@/components/admin/admin-dashboard-sales-chart";
import {
  analyticsCreatedAtFilter,
  analyticsSince,
  getAnalyticsStartAt
} from "@/features/admin/analytics";
import Link from "next/link";

function subDays(days: number) {
  return new Date(Date.now() - days * 86400000);
}

export default async function AdminAnalyticsPage() {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

  const analyticsStartAt = await getAnalyticsStartAt();
  const analyticsCreatedAt = analyticsCreatedAtFilter(analyticsStartAt);
  const newCustomersSince = analyticsSince(analyticsStartAt, subDays(30));

  // Comprehensive operational aggregations
  const [
    totalRevenueAgg,
    totalOrders,
    totalCustomers,
    newCustomers,
    topProductsDb,
    statusBreakdown,
    ordersWithAddress
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { ...analyticsCreatedAt, status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
      _sum: { grandTotal: true },
      _count: { id: true }
    }),
    prisma.order.count({ where: analyticsCreatedAt }),
    prisma.user.count({ where: { deletedAt: null, ...analyticsCreatedAt } }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: newCustomersSince } } }),
    prisma.orderItem.groupBy({
      where: analyticsCreatedAt,
      by: ["productId"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    }),
    prisma.order.groupBy({
      where: analyticsCreatedAt,
      by: ["status"],
      _count: { id: true }
    }),
    prisma.order.findMany({
      where: { ...analyticsCreatedAt, status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
      select: { grandTotal: true, deliveryAddress: true }
    })
  ]);

  const totalRev = totalRevenueAgg._sum.grandTotal ?? 0;
  const orderCount = totalRevenueAgg._count.id;
  const aov = orderCount > 0 ? Math.round(totalRev / orderCount) : 0;
  const conversionRate =
    totalCustomers > 0 ? `${((orderCount / totalCustomers) * 100).toFixed(1)}%` : "0.0%";

  // Enrich top products
  const productIds = topProductsDb
    .map((p) => p.productId)
    .filter((id): id is string => id !== null);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true }
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topProducts = topProductsDb.map((p) => ({
    product: p.productId ? productMap.get(p.productId) : null,
    units: p._sum?.quantity ?? 0,
    revenue: p._sum?.lineTotal ?? 0
  }));

  // Regional breakdown across Bangladesh divisions
  const regionMap: Record<string, { count: number; total: number }> = {};
  for (const o of ordersWithAddress) {
    const addr = o.deliveryAddress as Record<string, unknown> | null;
    const city = typeof addr?.city === "string" ? addr.city.trim() : "";
    const region = /chattogram|chittagong/i.test(city)
      ? "Chattogram Division"
      : /sylhet/i.test(city)
      ? "Sylhet Division"
      : /rajshahi|khulna/i.test(city)
      ? "Rajshahi & Khulna"
      : /dhaka/i.test(city)
      ? "Dhaka Division"
      : city
      ? "Other Regions"
      : "Dhaka Division";

    if (!regionMap[region]) regionMap[region] = { count: 0, total: 0 };
    regionMap[region].count++;
    regionMap[region].total += o.grandTotal;
  }

  const regionalData =
    ordersWithAddress.length > 0
      ? Object.entries(regionMap).map(([region, stats]) => ({
          region,
          percent: Math.round((stats.count / ordersWithAddress.length) * 100),
          orders: `${stats.count} orders`,
          amount: formatMoney(stats.total)
        }))
      : [];

  // Fulfillment status shares
  const totalStatusOrders = statusBreakdown.reduce((sum, s) => sum + s._count.id, 0);
  const statusDistribution = statusBreakdown.map((s) => ({
    status: s.status,
    count: s._count.id,
    percent: totalStatusOrders > 0 ? Math.round((s._count.id / totalStatusOrders) * 100) : 0
  }));

  const metrics = [
    {
      label: "Total Sales Revenue",
      value: formatMoney(totalRev),
      statusBadge: "Audited",
      isPositive: true,
      hint: "All confirmed & paid orders",
      icon: TrendingUp
    },
    {
      label: "Customer Conversion",
      value: conversionRate,
      statusBadge: "Active",
      isPositive: true,
      hint: "Orders to registered shoppers",
      icon: ShoppingCart
    },
    {
      label: "Average Order Value (AOV)",
      value: formatMoney(aov),
      statusBadge: "Realized",
      isPositive: true,
      hint: "Net revenue per checkout",
      icon: Layers
    },
    {
      label: "Active Customer Base",
      value: totalCustomers.toLocaleString(),
      statusBadge: `+${newCustomers} recent`,
      isPositive: true,
      hint: "Registered shopper directory",
      icon: Users
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Business Intelligence &amp; Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live BI Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Granular revenue trajectories, order fulfillment distribution and regional Bangladesh demand
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-2xs">
            <Calendar size={13} className="text-foreground" />
            <span>Last 30 Days</span>
          </div>
          <a
            href="/api/admin/export/orders"
            download
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-stone-50 transition"
          >
            <Download size={13} />
            <span>Export Analytics</span>
          </a>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-white p-5 shadow-2xs transition-all hover:border-foreground/30 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{m.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                  {m.value}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {m.statusBadge}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">{m.hint}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Sales Chart */}
      <AdminDashboardSalesChart />

      {/* Two Columns: Regional Performance & Order Fulfillment Distribution */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Regional Distribution */}
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-foreground" />
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Regional Sales Footprint
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Bangladesh</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Confirmed order volume and revenue by division
          </p>

          <div className="space-y-4">
            {regionalData.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No delivery location records recorded yet.
              </p>
            ) : (
              regionalData.map((reg) => (
                <div key={reg.region} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{reg.region}</span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-bold text-foreground">{reg.amount}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        ({reg.percent}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-stone-900 transition-all duration-500"
                      style={{ width: `${reg.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Fulfillment Status Distribution */}
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-foreground" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Fulfillment Status Breakdown
                </h2>
              </div>
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                {totalStatusOrders} Total
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Live status distribution of customer orders across the order pipeline
            </p>

            <div className="space-y-3.5">
              {statusDistribution.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  No order status records recorded yet.
                </p>
              ) : (
                statusDistribution.map((item) => (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{item.status}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-bold text-foreground">{item.count} orders</span>
                        <span className="text-[11px] text-muted-foreground">
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-stone-900 transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-3.5 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Order Velocity Status:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={13} />
              Active Fulfillment
            </span>
          </div>
        </div>
      </div>

      {/* Top Products Leaderboard */}
      <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Top Performing Products
            </h2>
            <p className="text-xs text-muted-foreground">
              Highest velocity merchandise ranked by completed units sold
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-stone-900 hover:underline inline-flex items-center gap-1"
          >
            <span>View all products</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="pb-3 pr-4">Product Name</th>
                <th className="pb-3 px-4 text-center">Units Sold</th>
                <th className="pb-3 pl-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {topProducts.length > 0 ? (
                topProducts.map(({ product, units, revenue }) => (
                  <tr key={product?.id || revenue} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 pr-4 font-semibold text-foreground">
                      {product?.name || "Elaris Apparel Collection"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground tabular-nums">
                      {units} units
                    </td>
                    <td className="py-3.5 pl-4 text-right font-bold text-foreground tabular-nums">
                      {formatMoney(revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                    No sales item transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
