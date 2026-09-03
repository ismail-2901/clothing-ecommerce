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

export default async function AdminOrdersPage() {
  const rawOrders = await prisma.order.findMany({
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

      {/* Search/filter bar */}
      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-background px-4">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search order number, customer name, email…"
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
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
