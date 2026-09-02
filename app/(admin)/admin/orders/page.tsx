export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { ChevronRight, Search } from "lucide-react";

// Replace with DB query once migration is active.
const orders = [
  { id: "ord_1", number: "ATC-0001", customer: "Nusrat Rahman", email: "nusrat@example.com", status: "DELIVERED", payment: "PAID", total: 490000, date: "2024-12-01" },
  { id: "ord_2", number: "ATC-0002", customer: "Kamrul Hasan", email: "kamrul@example.com", status: "SHIPPED", payment: "PAID", total: 245000, date: "2024-12-10" },
  { id: "ord_3", number: "ATC-0003", customer: "Sadia Islam", email: "sadia@example.com", status: "PROCESSING", payment: "PENDING", total: 145000, date: "2024-12-14" },
  { id: "ord_4", number: "ATC-0004", customer: "Rifat Ahmed", email: "rifat@example.com", status: "PENDING", payment: "PENDING", total: 395000, date: "2024-12-15" },
  { id: "ord_5", number: "ATC-0005", customer: "Meherun Nesa", email: "meherun@example.com", status: "CANCELLED", payment: "CANCELLED", total: 290000, date: "2024-12-12" },
  { id: "ord_6", number: "ATC-0006", customer: "Tanvir Hossain", email: "tanvir@example.com", status: "FAILED_DELIVERY", payment: "PAID", total: 245000, date: "2024-12-08" },
];

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "muted" | "default" }> = {
  DELIVERED:        { label: "Delivered",         variant: "success" },
  SHIPPED:          { label: "Shipped",            variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery",   variant: "warning" },
  PROCESSING:       { label: "Processing",          variant: "muted" },
  PACKED:           { label: "Packed",              variant: "muted" },
  CONFIRMED:        { label: "Confirmed",           variant: "muted" },
  PENDING:          { label: "Pending",             variant: "muted" },
  CANCELLED:        { label: "Cancelled",           variant: "danger" },
  FAILED_DELIVERY:  { label: "Failed delivery",     variant: "danger" },
  RETURN_REQUESTED: { label: "Return requested",    variant: "warning" },
  RETURNED:         { label: "Returned",            variant: "danger" },
  REFUNDED:         { label: "Refunded",            variant: "danger" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const map = statusMap[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={map.variant}>{map.label}</Badge>;
}

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
        </div>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>

      {/* Search/filter bar */}
      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-background px-4">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search order number, customer…"
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Filter chips */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Failed delivery"].map((f) => (
          <button
            key={f}
            type="button"
            className="rounded-sm border border-border px-3 py-1.5 hover:bg-muted data-[active=true]:bg-foreground data-[active=true]:text-background"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Order", "Customer", "Date", "Status", "Payment", "Total", ""].map((h) => (
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
                <td className="px-4 py-4 font-semibold">{order.number}</td>
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

      {/* Pagination placeholder */}
      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing 1–{orders.length} of {orders.length}</p>
        <div className="flex gap-2">
          <button type="button" disabled className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <button type="button" disabled className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
