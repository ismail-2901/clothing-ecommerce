export const dynamic = "force-dynamic";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, MapPin, CreditCard, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

type PageProps = { params: Promise<{ id: string }> };

const TIMELINE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
  FAILED_DELIVERY: "Failed delivery"
};

function statusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return <Badge variant="warning">Shipped</Badge>;
    case "CANCELLED":
    case "RETURNED":
    case "FAILED_DELIVERY":
      return <Badge variant="danger">{STATUS_LABEL[status] ?? status}</Badge>;
    case "REFUNDED":
      return <Badge variant="muted">Refunded</Badge>;
    default:
      return <Badge variant="muted">{STATUS_LABEL[status] ?? status}</Badge>;
  }
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session?.userId) {
    redirect("/login?next=/account/orders");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } }
        }
      },
      history: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  // IDOR protection — only the owner can view
  if (!order || order.userId !== session.userId) {
    notFound();
  }

  const isTerminal = ["CANCELLED", "RETURNED", "REFUNDED", "FAILED_DELIVERY"].includes(order.status);
  const timelineIndex = TIMELINE_STATUSES.indexOf(order.status as (typeof TIMELINE_STATUSES)[number]);
  const deliveryAddress = order.deliveryAddress as Record<string, string>;

  return (
    <div className="container-shell py-10">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Order</p>
          <h1 className="mt-1 text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {statusBadge(order.status)}
      </div>

      {/* Order timeline */}
      {!isTerminal && (
        <div className="mt-8 rounded-lg border border-border bg-background p-6">
          <p className="text-sm font-semibold">Order progress</p>
          <div className="mt-5 flex items-center gap-0">
            {TIMELINE_STATUSES.map((step, i) => {
              const completed = timelineIndex >= i;
              const current = timelineIndex === i;
              const historyEntry = order.history.find((h) => h.newStatus === step);
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 ${completed ? "bg-foreground" : "bg-border"}`} />
                    )}
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                      current
                        ? "border-foreground bg-foreground text-background"
                        : completed
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground"
                    }`}>
                      {completed
                        ? <CheckCircle2 size={14} />
                        : <Circle size={14} />}
                    </div>
                    {i < TIMELINE_STATUSES.length - 1 && (
                      <div className={`h-0.5 flex-1 ${completed && timelineIndex > i ? "bg-foreground" : "bg-border"}`} />
                    )}
                  </div>
                  <p className={`mt-2 text-center text-xs ${current ? "font-semibold" : "text-muted-foreground"}`}>
                    {STATUS_LABEL[step]}
                  </p>
                  {historyEntry && (
                    <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
                      {historyEntry.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <p className="font-semibold flex items-center gap-2">
                <Package size={16} />
                Items ({order.items.length})
              </p>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  {item.product.images[0] && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt}
                      className="h-20 w-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.color} · {item.size}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatMoney(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Price summary */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold">Order summary</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>−{formatMoney(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold flex items-center gap-2">
              <MapPin size={16} />
              Delivery address
            </p>
            <div className="mt-3 text-sm text-muted-foreground space-y-0.5">
              <p className="text-foreground font-medium">{deliveryAddress.name}</p>
              <p>{deliveryAddress.line1}</p>
              {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
              <p>{deliveryAddress.city}{deliveryAddress.area ? `, ${deliveryAddress.area}` : ""}</p>
              {deliveryAddress.postalCode && <p>{deliveryAddress.postalCode}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold flex items-center gap-2">
              <CreditCard size={16} />
              Payment
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium text-foreground capitalize">
                {order.paymentStatus.toLowerCase()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
