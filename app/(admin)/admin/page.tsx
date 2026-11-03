export const dynamic = "force-dynamic";

import {
  TrendingUp,
  ShoppingCart,
  Users,
  ShieldAlert,
  Download,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  ArrowUpRight
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { formatMoney } from "@/lib/utils/money";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import { AdminDashboardSalesChart } from "@/components/admin/admin-dashboard-sales-chart";

// Derived Prisma types — exact shapes matching the queries below
type LowStockVariant = Prisma.ProductVariantGetPayload<{
  include: { product: { select: { name: true; slug: true } } };
}>;
type RecentOrder = Prisma.OrderGetPayload<{
  include: {
    user: { select: { name: true; email: true } };
    items: { select: { name: true; quantity: true } };
    payments: { select: { provider: true } };
  };
}>;
type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export default async function AdminDashboardPage() {
  let orderStats = { _sum: { grandTotal: 0 }, _count: { id: 0 } };
  let customerCount = 0;
  let pendingConfirmationCount = 0;
  let packedTodayCount = 0;
  let failedDeliveryCount = 0;
  let riskCount = 0;
  let lowStockVariants: LowStockVariant[] = [];
  let recentOrders: RecentOrder[] = [];
  let categories: CategoryWithCount[] = [];

  try {
    const results = await Promise.all([
      prisma.order.aggregate({
        where: { status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PACKED" } }),
      prisma.order.count({ where: { status: "FAILED_DELIVERY" } }),
      prisma.riskAssessment.count({ where: { level: { in: ["HIGH", "CRITICAL"] } } }),
      prisma.productVariant.findMany({
        where: { stockQuantity: { lte: 5 }, deletedAt: null },
        include: { product: { select: { name: true, slug: true } } },
        take: 5
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1, select: { name: true, quantity: true } },
          payments: { select: { provider: true }, take: 1, orderBy: { createdAt: "desc" } }
        }
      }),
      prisma.category.findMany({
        take: 4,
        include: {
          _count: { select: { products: true } }
        }
      })
    ]);

    orderStats = (results[0] as typeof orderStats) ?? orderStats;
    customerCount = results[1] ?? 0;
    pendingConfirmationCount = results[2] ?? 0;
    packedTodayCount = results[3] ?? 0;
    failedDeliveryCount = results[4] ?? 0;
    riskCount = results[5] ?? 0;
    lowStockVariants = (results[6] as LowStockVariant[]) ?? [];
    recentOrders = (results[7] as RecentOrder[]) ?? [];
    categories = (results[8] as CategoryWithCount[]) ?? [];
  } catch (err) {
    console.error("[AdminDashboardPage] Database query fallback:", err);
  }

  const totalRevenue = orderStats._sum.grandTotal ?? 0;
  const totalOrders = orderStats._count.id;

  const metrics = [
    {
      label: "Total Sales Revenue",
      value: formatMoney(totalRevenue),
      statusBadge: "Live",
      isPositive: true,
      hint: "All confirmed & paid orders",
      icon: TrendingUp
    },
    {
      label: "Completed Orders",
      value: totalOrders.toLocaleString(),
      statusBadge: pendingConfirmationCount > 0 ? `${pendingConfirmationCount} pending` : "All clear",
      isPositive: pendingConfirmationCount === 0,
      hint: `${pendingConfirmationCount} orders awaiting fulfillment`,
      icon: ShoppingCart
    },
    {
      label: "Customer Accounts",
      value: customerCount.toLocaleString(),
      statusBadge: "Verified",
      isPositive: true,
      hint: "Registered shopper directory",
      icon: Users
    },
    {
      label: "Risk & Exceptions",
      value: (riskCount + pendingConfirmationCount).toLocaleString(),
      statusBadge: riskCount > 0 ? `${riskCount} high risk` : "Healthy",
      isPositive: riskCount === 0,
      hint: riskCount > 0 ? "Requires manual review" : "No open risk alerts",
      icon: ShieldAlert
    }
  ];

  // Category shares calculation
  const totalCatProducts = categories.reduce((sum, c) => sum + c._count.products, 0);
  const categoryHighlights =
    categories.length > 0
      ? categories.map((c) => {
          const percentage =
            totalCatProducts > 0
              ? Math.round((c._count.products / totalCatProducts) * 100)
              : 0;
          return {
            name: c.name,
            percentage,
            count: `${c._count.products} products`
          };
        })
      : [];

  const paymentBadgeStyle: Record<string, string> = {
    BKASH: "bg-pink-50 text-pink-700 border-pink-200",
    NAGAD: "bg-orange-50 text-orange-700 border-orange-200",
    CARD: "bg-blue-50 text-blue-700 border-blue-200",
    COD: "bg-stone-100 text-stone-700 border-stone-200"
  };

  const statusBadgeStyle: Record<string, string> = {
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    SHIPPED: "bg-purple-50 text-purple-700 border-purple-200"
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Commerce Control Center
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time sales velocity, fulfillment queues and store performance metrics
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
            <span>Export Orders</span>
          </a>
        </div>
      </div>

      {/* 4 KPI Cards Strip */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-2xs transition-all hover:border-foreground/30 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {metric.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                  <Icon size={16} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {metric.value}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[10px] border ${
                    metric.isPositive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {metric.statusBadge}
                </span>
                <span className="text-muted-foreground text-[11px] truncate">
                  {metric.hint}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Bento Row: Sales Chart + Top Categories */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.85fr_1.15fr]">
        <AdminDashboardSalesChart />

        {/* Top Selling Categories */}
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-foreground" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Category Volume Share
                </h2>
              </div>
              <Link
                href="/admin/categories"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Inventory and product distribution across top active catalog categories
            </p>

            <div className="mt-5 space-y-4">
              {categoryHighlights.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No catalog categories recorded yet.
                </p>
              ) : (
                categoryHighlights.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{cat.name}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-medium text-muted-foreground">{cat.count}</span>
                        <span className="text-[11px] font-bold text-stone-900">
                          ({cat.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-stone-900 transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-stone-50/70 p-3.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Catalog Category Footprint:</span>
            <span className="font-bold text-foreground tabular-nums">
              {categories.length} Categories Active
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Bento Row: Recent Orders & Inventory Alerts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr_1.2fr]">
        {/* Recent Orders Table */}
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Recent Orders
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest customer checkout transactions &amp; live payment statuses
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-stone-900 hover:underline inline-flex items-center gap-1"
              >
                <span>View all orders</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="pb-3 pr-4">Order ID</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Payment</th>
                    <th className="pb-3 px-4">Fulfillment</th>
                    <th className="pb-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const statusClass =
                        statusBadgeStyle[order.status] ||
                        "bg-stone-100 text-foreground border-border";
                      const paymentMethod = order.payments[0]?.provider || "COD";
                      const paymentClass =
                        paymentBadgeStyle[paymentMethod] ||
                        "bg-stone-100 text-foreground border-border";

                      const customerName =
                        order.user?.name ||
                        (order.customerSnapshot as Record<string, string> | null)?.name ||
                        (order.deliveryAddress as Record<string, string> | null)?.name ||
                        "Customer";
                      const customerEmail =
                        order.user?.email ||
                        (order.customerSnapshot as Record<string, string> | null)?.email ||
                        order.guestEmail ||
                        "Guest checkout";

                      return (
                        <tr key={order.id} className="hover:bg-stone-50/70 transition">
                          <td className="py-3.5 pr-4 font-mono font-bold text-foreground">
                            <Link
                              href="/admin/orders"
                              className="hover:underline text-foreground"
                            >
                              #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-foreground truncate max-w-[140px]">
                              {customerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {customerEmail}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${paymentClass}`}
                            >
                              {paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 pl-4 text-right font-bold text-foreground tabular-nums">
                            {formatMoney(order.grandTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No recent transactions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Fast Actions */}
        <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Inventory Alerts
                </h2>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-stone-900 hover:underline"
              >
                Manage stock →
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockVariants.length > 0 ? (
                lowStockVariants.map((v) => {
                  const isOutOfStock = v.stockQuantity === 0;
                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-stone-50/70 p-3 hover:bg-stone-50 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground text-xs truncate">
                          {v.product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {v.color} / {v.size} ({v.sku})
                        </p>
                      </div>
                      <div className="shrink-0">
                        {isOutOfStock ? (
                          <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300">
                            Out of stock
                          </span>
                        ) : (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                            {v.stockQuantity} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Package size={28} className="mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Healthy Inventory</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No SKU variants below the 5-unit threshold.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <Link
              href="/admin/products/new"
              className="w-full text-center rounded-lg bg-stone-900 py-2 text-xs font-bold text-white hover:bg-stone-800 transition shadow-2xs"
            >
              + Create New Product
            </Link>
            <Link
              href="/admin/inventory"
              className="w-full text-center rounded-lg border border-border bg-white py-2 text-xs font-semibold text-foreground hover:bg-stone-50 transition"
            >
              Open Inventory Matrix
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
