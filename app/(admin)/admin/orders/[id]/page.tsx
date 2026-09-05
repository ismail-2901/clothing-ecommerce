export const dynamic = "force-dynamic";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, MapPin, User, ShieldAlert, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { AdminOrderStatusUpdater } from "@/components/admin/admin-order-status-updater";
import type { OrderStatus } from "@/features/orders/state-machine";
import { prisma } from "@/db/prisma";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
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
    case "DELIVERED": return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY": return <Badge variant="warning">{STATUS_LABEL[status]}</Badge>;
    case "CANCELLED":
    case "RETURNED":
    case "FAILED_DELIVERY": return <Badge variant="danger">{STATUS_LABEL[status]}</Badge>;
    default: return <Badge variant="muted">{STATUS_LABEL[status] ?? status}</Badge>;
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 30) return "text-amber-600";
  return "text-green-600";
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const isMasterAdmin = isValidAdminSession(token);

  if (!isMasterAdmin) {
    const session = await getServerSession();
    if (!session?.userId) redirect("/login");

    const userRoles = await prisma.userRole.findMany({
      where: { userId: session.userId },
      include: { role: true }
    });
    const isAdmin = userRoles.some((ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN");
    if (!isAdmin) redirect("/admin");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
          variant: { select: { sku: true, color: true, size: true } }
        }
      },
      history: { orderBy: { createdAt: "asc" } },
      riskAssessment: { include: { signals: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!order) notFound();

  const deliveryAddress = order.deliveryAddress as Record<string, string>;
  const customerSnapshot = order.customerSnapshot as Record<string, string> | null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /> Orders
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin · Order</p>
          <h1 className="mt-1 text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {statusBadge(order.status)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: items + history */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <p className="font-semibold flex items-center gap-2"><Package size={16} /> Items ({order.items.length})</p>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  {item.product.images[0] && (
                    <img src={item.product.images[0].url} alt={item.product.images[0].alt} className="h-16 w-12 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.variant.color} · {item.variant.size} · SKU: {item.variant.sku}</p>
                    <p className="text-xs mt-1">{formatMoney(item.unitPrice)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status history */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold">Status history</p>
            <div className="mt-4 space-y-3">
              {order.history.map((h) => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-foreground" />
                  <div>
                    <span className="font-medium">{STATUS_LABEL[h.newStatus] ?? h.newStatus}</span>
                    {h.previousStatus && (
                      <span className="text-muted-foreground"> ← {STATUS_LABEL[h.previousStatus] ?? h.previousStatus}</span>
                    )}
                    {h.note && <p className="text-muted-foreground text-xs mt-0.5">{h.note}</p>}
                    <p className="text-xs text-muted-foreground">
                      {h.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: summary + risk + customer */}
        <div className="space-y-4">
          <AdminOrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
          />

          {/* Price summary */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold">Order summary</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>−{formatMoney(order.discountTotal)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>{formatMoney(order.grandTotal)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Payment status</span>
                <span className="capitalize">{order.paymentStatus.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold flex items-center gap-2"><User size={16} /> Customer</p>
            {order.user ? (
              <div className="mt-3 text-sm space-y-1">
                <Link href={`/admin/customers/${order.user.id}`} className="font-medium hover:underline">{order.user.name ?? "—"}</Link>
                <p className="text-muted-foreground">{order.user.email}</p>
                {order.user.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted-foreground">
                <p>Guest order</p>
                {customerSnapshot && <p>{customerSnapshot.email}</p>}
              </div>
            )}
          </div>

          {/* Delivery address */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold flex items-center gap-2"><MapPin size={16} /> Delivery</p>
            <div className="mt-3 text-sm text-muted-foreground space-y-0.5">
              <p className="text-foreground font-medium">{deliveryAddress.name}</p>
              <p>{deliveryAddress.line1}</p>
              {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
              <p>{deliveryAddress.city}{deliveryAddress.area ? `, ${deliveryAddress.area}` : ""}</p>
            </div>
          </div>

          {/* Risk */}
          {order.riskAssessment && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="font-semibold flex items-center gap-2"><ShieldAlert size={16} /> Risk</p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`text-2xl font-semibold ${scoreColor(order.riskAssessment.score)}`}>
                  {order.riskAssessment.score}
                </span>
                <span className="text-sm text-muted-foreground capitalize">
                  {order.riskAssessment.level.toLowerCase()} risk
                </span>
              </div>
              {order.riskAssessment.signals.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {order.riskAssessment.signals.map((s) => (
                    <div key={s.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
