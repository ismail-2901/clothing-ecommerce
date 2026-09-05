export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { ChevronRight, Search, ShoppingBag } from "lucide-react";
import { prisma } from "@/db/prisma";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "muted" | "default" }> = {
  DELIVERED: { label: "Delivered", variant: "success" },
  SHIPPED: { label: "Shipped", variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "warning" },
  PROCESSING: { label: "Processing", variant: "muted" },
  PACKED: { label: "Packed", variant: "muted" },
  CONFIRMED: { label: "Confirmed", variant: "muted" },
  PENDING: { label: "Pending", variant: "muted" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  FAILED_DELIVERY: { label: "Failed delivery", variant: "danger" },
  RETURN_REQUESTED: { label: "Return requested", variant: "warning" },
  RETURNED: { label: "Returned", variant: "danger" },
  REFUNDED: { label: "Refunded", variant: "danger" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const map = statusMap[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={map.variant}>{map.label}</Badge>;
}

import { AdminSearchInput } from "@/components/admin/admin-search-input";
import type { OrderStatus } from "@prisma/client";

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

  const rawOrders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
      payments: { select: { status: true, provider: true }, take: 1, orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const orders = rawOrders.map((o) => {
    const address = (o.deliveryAddress as Record<string, string>) || {};
    const customerName = o.user?.name || address.name || "Guest Customer";
    const customerEmail = o.user?.email || o.guestEmail || address.phone || "—";
    const payment = o.payments[0]?.status || o.paymentStatus || "PENDING";

    return {
      id: o.id,
      number: o.orderNumber,
      customer: customerName,
      email: customerEmail,
      status: o.status,
      payment,
      total: o.grandTotal,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      date: o.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live order transactions</p>
        </div>
        <p className="text-sm font-semibold">{orders.length} total</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <AdminSearchInput placeholder="Search order number, customer, email…" />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-6 sm:pt-0">
          {[
            { label: "All", value: "" },
            { label: "Pending", value: "PENDING" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "Processing", value: "PROCESSING" },
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
                className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <ShoppingBag size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When customers place orders via the storefront checkout, they will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Order", "Customer", "Date", "Status", "Payment", "Items", "Total", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="bg-background hover:bg-muted/30 transition">
                  <td className="px-4 py-4 font-semibold font-mono">{order.number}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{order.date}</td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={order.payment === "PAID" ? "success" : order.payment === "CANCELLED" ? "danger" : "muted"}>
                      {order.payment.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">{order.itemCount}</td>
                  <td className="px-4 py-4 font-semibold whitespace-nowrap">{formatMoney(order.total)}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted"
                    >
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
