import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";

export const dynamic = "force-dynamic";

import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

function statusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return <Badge variant="warning">Shipped</Badge>;
    case "CANCELLED":
    case "RETURNED":
      return <Badge variant="danger">Cancelled</Badge>;
    case "REFUNDED":
      return <Badge variant="muted">Refunded</Badge>;
    default:
      return <Badge variant="muted">{status.toLowerCase().replace(/_/g, " ")}</Badge>;
  }
}

export default async function AccountOrdersPage() {
  const session = await getServerSession();
  if (!session?.userId) {
    redirect("/login?next=/account/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true } }
    },
    take: 50
  });

  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Package size={40} className="text-muted-foreground" />
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Once you place an order, you can track it here.
          </p>
          <Link
            href="/shop"
            className="mt-2 inline-flex h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background hover:bg-zinc-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md border border-border p-2.5">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {formatMoney(order.grandTotal)} ·{" "}
                    {order.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(order.status)}
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

