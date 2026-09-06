export const dynamic = "force-dynamic";

import Link from "next/link";
import { formatMoney } from "@/lib/utils/money";
import {
  ShoppingBag,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { prisma } from "@/db/prisma";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import type { OrderStatus } from "@prisma/client";

const statusMap: Record<string, { label: string; class: string }> = {
  DELIVERED: { label: "Delivered", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SHIPPED: { label: "Shipped", class: "bg-purple-50 text-purple-700 border-purple-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", class: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  PROCESSING: { label: "Processing", class: "bg-blue-50 text-blue-700 border-blue-200" },
  PACKED: { label: "Packed", class: "bg-sky-50 text-sky-700 border-sky-200" },
  CONFIRMED: { label: "Confirmed", class: "bg-teal-50 text-teal-700 border-teal-200" },
  PENDING: { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { label: "Cancelled", class: "bg-rose-50 text-rose-700 border-rose-200" },
  FAILED_DELIVERY: { label: "Failed Delivery", class: "bg-rose-50 text-rose-700 border-rose-200" },
  RETURN_REQUESTED: { label: "Return Requested", class: "bg-amber-50 text-amber-700 border-amber-200" },
  RETURNED: { label: "Returned", class: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  REFUNDED: { label: "Refunded", class: "bg-zinc-100 text-zinc-700 border-zinc-200" },
};

const paymentBadgeStyle: Record<string, string> = {
  BKASH: "bg-pink-50 text-pink-700 border-pink-200",
  NAGAD: "bg-orange-50 text-orange-700 border-orange-200",
  CARD: "bg-blue-50 text-blue-700 border-blue-200",
  COD: "bg-zinc-100 text-zinc-700 border-zinc-200"
};

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { q, status } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {};

  if (status && status.toUpperCase() in statusMap) {
    whereClause.status = status.toUpperCase() as OrderStatus;
  }

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { guestEmail: { contains: term, mode: "insensitive" } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [rawOrders, totalCount, pendingCount, inTransitCount, deliveredCount] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true, name: true } },
        payments: { select: { status: true, provider: true }, take: 1, orderBy: { createdAt: "desc" } }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.order.count({ where: { status: { in: ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
  ]);

  const orders = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
    customer: o.user?.name || "Guest Shopper",
    email: o.user?.email || o.guestEmail || "No email",
    itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    firstItem: o.items[0]?.name || "Clothing item",
    total: o.grandTotal,
    status: o.status,
    paymentMethod: o.payments[0]?.provider || "COD",
    paymentStatus: o.paymentStatus || o.payments[0]?.status || "PENDING",
    date: new Date(o.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }),
    time: new Date(o.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }));

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Orders Management
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track customer transactions, dispatch fulfillment workflows, and verify courier deliveries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition"
          >
            <Download size={14} />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Lifetime store orders</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pending Confirmation</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Needs Review
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Awaiting staff confirmation</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">In Fulfillment</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{inTransitCount}</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Processing &amp; Transit
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Packing or with courier</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Delivered &amp; Completed</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{deliveredCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Successful
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Closed transactions</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="w-full sm:max-w-md">
          <AdminSearchInput placeholder="Search order #, customer, email…" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Orders", value: "" },
            { label: "Pending", value: "PENDING" },
            { label: "Processing", value: "PROCESSING" },
            { label: "Shipped", value: "SHIPPED" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Cancelled", value: "CANCELLED" },
          ].map((tab) => {
            const active = (status?.toUpperCase() || "") === tab.value;
            const queryParams = new URLSearchParams();
            if (q) queryParams.set("q", q);
            if (tab.value) queryParams.set("status", tab.value);
            const href = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <ShoppingBag size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No orders found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            There are no customer orders matching your current filter criteria.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((o) => {
                  const statusInfo = statusMap[o.status] || {
                    label: o.status,
                    class: "bg-muted text-foreground border-border"
                  };
                  const paymentClass = paymentBadgeStyle[o.paymentMethod.toUpperCase()] || "bg-zinc-100 text-zinc-700 border-zinc-200";

                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        <p className="font-medium text-foreground">{o.date}</p>
                        <p className="text-[10px]">{o.time}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">{o.customer}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {o.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                          {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${paymentClass}`}>
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-foreground">
                        {formatMoney(o.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
