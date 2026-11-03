export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Package,
  MapPin,
  User,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Phone,
  Mail,
  FileText
} from "lucide-react";

import { formatMoney } from "@/lib/utils/money";
import { getServerUser } from "@/lib/auth/server";
import { AdminOrderStatusUpdater } from "@/components/admin/admin-order-status-updater";
import { AdminOrderDetailActions } from "@/components/admin/admin-order-detail-actions";
import {
  orderTimeline,
  type OrderStatus
} from "@/features/orders/state-machine";
import { prisma } from "@/db/prisma";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; stepLabel: string }> = {
  PENDING: {
    label: "Pending Review",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    stepLabel: "Placed"
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    stepLabel: "Confirmed"
  },
  PROCESSING: {
    label: "Processing",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    stepLabel: "Processing"
  },
  PACKED: {
    label: "Packed in Warehouse",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    stepLabel: "Packed"
  },
  SHIPPED: {
    label: "Shipped & Dispatched",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    stepLabel: "Shipped"
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    stepLabel: "Out for Delivery"
  },
  DELIVERED: {
    label: "Delivered & Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    stepLabel: "Delivered"
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    stepLabel: "Cancelled"
  },
  FAILED_DELIVERY: {
    label: "Failed Delivery",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    stepLabel: "Failed"
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    stepLabel: "Return Requested"
  },
  RETURNED: {
    label: "Returned to Warehouse",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    stepLabel: "Returned"
  },
  REFUNDED: {
    label: "Refunded",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    stepLabel: "Refunded"
  }
};

function scoreColor(score: number) {
  if (score >= 80) return "text-rose-600 bg-rose-50 border-rose-200";
  if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
  if (score >= 30) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }]
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
          variant: { select: { sku: true, color: true, size: true } }
        }
      },
      history: { orderBy: { createdAt: "desc" } },
      riskAssessment: { include: { signals: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 2 }
    }
  });

  if (!order) notFound();

  const deliveryAddress = order.deliveryAddress as Record<string, string> | null;
  const customerSnapshot = order.customerSnapshot as Record<string, string> | null;

  const customerName =
    order.user?.name ||
    customerSnapshot?.name ||
    deliveryAddress?.name ||
    "Guest Customer";

  const customerEmail =
    order.user?.email ||
    customerSnapshot?.email ||
    order.guestEmail ||
    "No email";

  const customerPhone =
    deliveryAddress?.phone ||
    order.user?.phone ||
    customerSnapshot?.phone ||
    order.guestPhone ||
    null;

  const paymentProvider = order.payments[0]?.provider || "COD";
  const paymentStatus = order.paymentStatus || order.payments[0]?.status || "PENDING";
  const isPaid = paymentStatus.toUpperCase() === "PAID";

  const statusConfig = STATUS_CONFIG[order.status] || {
    label: order.status,
    badgeClass: "bg-muted text-foreground border-border",
    stepLabel: order.status
  };

  // Format order for document print modal
  const printableOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingTotal: order.shippingTotal,
    grandTotal: order.grandTotal,
    user: order.user,
    customerSnapshot,
    deliveryAddress,
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      color: i.color || i.variant?.color,
      size: i.size || i.variant?.size,
      sku: i.sku || i.variant?.sku,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      productSnapshot: i.productSnapshot as Record<string, any> | null
    })),
    payments: order.payments
  };

  // Determine fulfillment linear stepper position
  const currentTimelineIndex = orderTimeline.indexOf(order.status as OrderStatus);
  const isTerminalOrBranch = currentTimelineIndex === -1;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 hover:text-foreground transition font-medium"
            >
              <ChevronLeft size={14} /> Orders Control Center
            </Link>
            <span>/</span>
            <span className="font-mono text-foreground">#{order.orderNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
              #{order.orderNumber}
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {paymentProvider} &bull; {paymentStatus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Created on{" "}
            {order.createdAt.toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>

        {/* Quick Document & Print Action Bar */}
        <AdminOrderDetailActions order={printableOrder} />
      </div>

      {/* Fulfillment Visual Stepper */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fulfillment Progression Pipeline
          </p>
          <span className="text-xs font-semibold text-foreground">
            Current Stage: <span className="font-bold text-foreground">{statusConfig.label}</span>
          </span>
        </div>

        {isTerminalOrBranch ? (
          /* Non-linear branch state banner (Cancelled, Failed, Return, Refund) */
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-100 p-2 text-rose-700">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Order Lifecycle State: {order.status}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  This transaction diverted from the standard linear fulfillment pipeline. Refer to
                  the audit history log below.
                </p>
              </div>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
          </div>
        ) : (
          /* 7-Step Linear Pipeline */
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px] grid grid-cols-7 gap-2">
              {orderTimeline.map((step, idx) => {
                const isPast = idx < currentTimelineIndex;
                const isCurrent = idx === currentTimelineIndex;
                const stepConfig = STATUS_CONFIG[step];

                return (
                  <div key={step} className="flex flex-col items-center text-center relative group">
                    {/* Horizontal Connector Line */}
                    {idx > 0 && (
                      <div
                        className={`absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2 -z-0 transition-colors ${
                          isPast || isCurrent ? "bg-foreground" : "bg-border"
                        }`}
                      />
                    )}

                    {/* Step Circle Badge */}
                    <div
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                        isCurrent
                          ? "bg-foreground text-background ring-4 ring-foreground/15 shadow-sm scale-110"
                          : isPast
                          ? "bg-foreground text-background"
                          : "border border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 size={14} className="stroke-[2.5]" />
                      ) : (
                        <span className="font-mono text-[11px]">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Title */}
                    <span
                      className={`mt-2 text-[11px] font-semibold tracking-tight transition ${
                        isCurrent
                          ? "text-foreground font-black"
                          : isPast
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stepConfig?.stepLabel || step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Bento Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Items, Pricing, History (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Table Card */}
          <div className="rounded-xl border border-border bg-background shadow-xs overflow-hidden">
            <div className="border-b border-border px-5 py-3.5 bg-muted/20 flex items-center justify-between">
              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Package size={15} />
                <span>
                  Order Items ({order.items.reduce((s, it) => s + it.quantity, 0)} total units)
                </span>
              </p>
              <span className="text-xs font-mono font-bold text-foreground">
                {order.items.length} line {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {order.items.map((item) => {
                const snapshot = item.productSnapshot as Record<string, any> | null;
                const itemImg =
                  snapshot?.image || item.product?.images?.[0]?.url || "/elaris-women.jpg";
                const itemName = snapshot?.name || item.name;
                const itemColor = snapshot?.color || item.variant?.color || item.color;
                const itemSize = snapshot?.size || item.variant?.size || item.size;
                const itemSku = snapshot?.sku || item.variant?.sku || item.sku || "—";

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={itemImg}
                        alt={itemName}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={itemImg.startsWith("/")}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{itemName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {itemColor && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[11px] font-medium text-foreground">
                            {itemColor}
                          </span>
                        )}
                        {itemSize && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[11px] font-medium text-foreground">
                            Size: {itemSize}
                          </span>
                        )}
                        <span className="font-mono text-[11px]">SKU: {itemSku}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {formatMoney(item.unitPrice)} &times; {item.quantity}{" "}
                        {item.quantity === 1 ? "unit" : "units"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-foreground">
                        {formatMoney(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Financial Calculation Card */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Financial Breakdown
            </p>

            <div className="space-y-2 text-xs border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-mono text-foreground font-medium">
                  {formatMoney(order.subtotal)}
                </span>
              </div>

              {order.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Promotional Discount</span>
                  <span className="font-mono font-bold">
                    −{formatMoney(order.discountTotal)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping / Courier Fee</span>
                <span className="font-mono text-foreground font-medium">
                  {order.shippingTotal === 0 ? "FREE" : formatMoney(order.shippingTotal)}
                </span>
              </div>

              <div className="flex justify-between border-t-2 border-border pt-2 text-sm font-black text-foreground">
                <span>Grand Total (Payable)</span>
                <span className="font-mono text-base">{formatMoney(order.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                <span>Payment Settlement</span>
                <span className="font-bold uppercase text-foreground">
                  {isPaid ? "Paid in Full" : "Due on Delivery (COD)"}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Status History & Audit Ledger */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Operational Audit Trail &amp; Status History
              </p>
              <span className="text-[11px] text-muted-foreground font-mono">
                {order.history.length} records
              </span>
            </div>

            <div className="space-y-4">
              {order.history.map((h, i) => (
                <div key={h.id || i} className="flex items-start gap-3 text-xs relative">
                  {/* Vertical connecting line */}
                  {i < order.history.length - 1 && (
                    <div className="absolute top-4 left-2 w-0.5 h-full -ml-[1px] bg-border" />
                  )}

                  <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-foreground flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-background" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 font-bold">
                      <span className="text-foreground">{h.newStatus}</span>
                      {h.previousStatus && (
                        <span className="text-muted-foreground font-normal">
                          &larr; was {h.previousStatus}
                        </span>
                      )}
                    </div>

                    {h.note && (
                      <p className="rounded-md bg-muted/40 border border-border/80 px-2.5 py-1 text-[11px] text-foreground font-mono">
                        {h.note}
                      </p>
                    )}

                    <p className="text-[10px] text-muted-foreground">
                      {new Date(h.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                      {h.actorId ? `• Staff ID: ${h.actorId}` : "• System Event"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Customer, Address, Risk (1 Col) */}
        <div className="space-y-5">
          {/* Status Updater Control Box */}
          <AdminOrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
          />

          {/* Customer Profile Card */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User size={15} />
              <span>Customer Information</span>
            </p>

            <div className="text-xs space-y-2 border-t border-border pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Full Name</p>
                {order.user ? (
                  <Link
                    href={`/admin/customers/${order.user.id}`}
                    className="font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{order.user.name ?? "Registered Customer"}</span>
                    <ExternalLink size={11} />
                  </Link>
                ) : (
                  <p className="font-bold text-foreground mt-0.5">{customerName}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</p>
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-medium text-foreground hover:underline inline-flex items-center gap-1.5 mt-0.5"
                >
                  <Mail size={12} className="text-muted-foreground" />
                  <span>{customerEmail}</span>
                </a>
              </div>

              {customerPhone && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Contact Phone</p>
                  <a
                    href={`tel:${customerPhone}`}
                    className="font-mono font-bold text-foreground hover:underline inline-flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone size={12} className="text-muted-foreground" />
                    <span>{customerPhone}</span>
                  </a>
                </div>
              )}

              <div className="pt-1">
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                  {order.user ? "Registered Account" : "Guest Shopper"}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin size={15} />
              <span>Delivery Destination</span>
            </p>

            <div className="text-xs space-y-1.5 border-t border-border pt-3">
              <p className="font-bold text-foreground">
                {deliveryAddress?.name || customerName}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {deliveryAddress?.line1 || "No street address"}
              </p>
              {deliveryAddress?.line2 && (
                <p className="text-muted-foreground">{deliveryAddress.line2}</p>
              )}
              <p className="font-semibold text-foreground">
                {deliveryAddress?.city || "Dhaka"}
                {deliveryAddress?.area ? `, ${deliveryAddress.area}` : ""}
                {deliveryAddress?.postalCode ? ` - ${deliveryAddress.postalCode}` : ""}
              </p>
              {deliveryAddress?.phone && (
                <p className="font-mono text-[11px] text-muted-foreground pt-1">
                  Recipient Phone: {deliveryAddress.phone}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CreditCard size={15} />
              <span>Payment Details</span>
            </p>

            <div className="text-xs space-y-2 border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-bold text-foreground">{paymentProvider}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status:</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              {order.payments[0]?.providerPaymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ref ID:</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {order.payments[0].providerPaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fraud & Risk Assessment Card */}
          {order.riskAssessment && (
            <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3">
              <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldAlert size={15} />
                <span>Risk &amp; Fraud Analysis</span>
              </p>

              <div className="border-t border-border pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-2xl font-black font-mono ${
                        scoreColor(order.riskAssessment.score).split(" ")[0]
                      }`}
                    >
                      {order.riskAssessment.score}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase ${scoreColor(
                      order.riskAssessment.score
                    )}`}
                  >
                    {order.riskAssessment.level} RISK
                  </span>
                </div>

                {/* Risk Gauge Bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      order.riskAssessment.score >= 80
                        ? "bg-rose-500"
                        : order.riskAssessment.score >= 60
                        ? "bg-orange-500"
                        : order.riskAssessment.score >= 30
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, order.riskAssessment.score)}%` }}
                  />
                </div>

                {order.riskAssessment.signals.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Detected Behavioral Signals
                    </p>
                    {order.riskAssessment.signals.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-start gap-2 rounded bg-muted/30 p-2 text-[11px] text-muted-foreground"
                      >
                        <AlertTriangle
                          size={13}
                          className="mt-0.5 shrink-0 text-amber-500"
                        />
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
