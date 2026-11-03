export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Package,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Ban,
  RotateCcw,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

type PageProps = { params: Promise<{ id: string }> };

function scoreColor(score: number) {
  if (score >= 80) return "text-rose-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 30) return "text-amber-600";
  return "text-emerald-600";
}

function statusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return <Badge variant="warning">In transit</Badge>;
    case "CANCELLED":
    case "RETURNED":
    case "FAILED_DELIVERY":
      return <Badge variant="danger">{status.replace(/_/g, " ").toLowerCase()}</Badge>;
    default:
      return <Badge variant="muted">{status.replace(/_/g, " ").toLowerCase()}</Badge>;
  }
}

function segmentBadge(segment: string) {
  switch (segment) {
    case "HIGH_VALUE":
      return (
        <span className="inline-block rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
          High Value / VIP
        </span>
      );
    case "REPEAT":
      return (
        <span className="inline-block rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          Repeat Shopper
        </span>
      );
    case "CANCEL_HEAVY":
      return (
        <span className="inline-block rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
          Cancel Heavy
        </span>
      );
    case "RETURN_HEAVY":
      return (
        <span className="inline-block rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
          Return Heavy
        </span>
      );
    case "NEW":
      return (
        <span className="inline-block rounded-md border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
          New Customer
        </span>
      );
    default:
      return (
        <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          Active Shopper
        </span>
      );
  }
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: {
            include: {
              variant: {
                select: { sku: true, color: true, size: true, product: { select: { name: true } } }
              }
            }
          },
          payments: { select: { provider: true, status: true } }
        }
      },
      riskAssessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { signals: true }
      },
      addresses: { where: { deletedAt: null }, orderBy: { isDefault: "desc" } },
      roles: { include: { role: true } },
      events: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!customer) notFound();

  const orders = customer.orders;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");
  const returnOrders = orders.filter((o) =>
    ["RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(o.status)
  );

  const totalDeliveredSpend = deliveredOrders.reduce((s, o) => s + o.grandTotal, 0);
  const totalGrossSpend = orders
    .filter((o) => !["CANCELLED", "FAILED_DELIVERY"].includes(o.status))
    .reduce((s, o) => s + o.grandTotal, 0);

  const ltvAmount = totalDeliveredSpend > 0 ? totalDeliveredSpend : totalGrossSpend;
  const avgOrderValue = orders.length > 0 ? Math.round(totalGrossSpend / orders.length) : 0;

  const riskAssessment = customer.riskAssessments[0];
  const riskScore = riskAssessment?.score ?? 0;
  const riskLevel = riskAssessment?.level ?? (riskScore >= 80 ? "CRITICAL" : riskScore >= 60 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW");

  // Determine Customer CRM Segment
  let customerSegment = "NEW";
  if (orders.length >= 3 && cancelledOrders.length / orders.length >= 0.33) {
    customerSegment = "CANCEL_HEAVY";
  } else if (orders.length >= 3 && returnOrders.length / orders.length >= 0.33) {
    customerSegment = "RETURN_HEAVY";
  } else if (ltvAmount >= 1000000) {
    customerSegment = "HIGH_VALUE";
  } else if (orders.length >= 2) {
    customerSegment = "REPEAT";
  } else if (orders.length === 1) {
    customerSegment = "ACTIVE";
  }

  const cancelRate = orders.length > 0 ? Math.round((cancelledOrders.length / orders.length) * 100) : 0;
  const returnRate = orders.length > 0 ? Math.round((returnOrders.length / orders.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Back Navigation & Breadcrumb */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft size={16} /> Back to Customer Directory
        </Link>
      </div>

      {/* Customer Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-xl border border-border bg-background p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xl font-bold uppercase shadow-xs">
            {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {customer.name ?? "Registered Customer"}
              </h1>
              {customer.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-mono">
                <Mail size={12} /> {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone size={12} /> {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Registered{" "}
                {customer.createdAt.toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {segmentBadge(customerSegment)}
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Lifetime Spend (LTV)</p>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(ltvAmount)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Completed order volume</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{orders.length}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {deliveredOrders.length} Delivered
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {cancelledOrders.length} cancelled ({cancelRate}%)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Average Order Value</p>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(avgOrderValue)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Across all placed checkouts</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Return &amp; Exchange Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                returnRate > 30 ? "text-rose-600" : "text-foreground"
              }`}
            >
              {returnRate}%
            </span>
            <span className="text-xs text-muted-foreground">({returnOrders.length} items)</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Courier delivery completion metric</p>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Order History & Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-background shadow-xs overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Package size={16} /> Order History ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders placed by this customer yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {orders.map((order) => {
                  const payment = order.payments[0];
                  return (
                    <div
                      key={order.id}
                      className="p-5 hover:bg-muted/15 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-bold text-foreground text-sm hover:underline"
                            >
                              #{order.orderNumber}
                            </Link>
                            {statusBadge(order.status)}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Placed on{" "}
                            {order.createdAt.toLocaleDateString("en-BD", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}{" "}
                            · {payment?.provider || "COD"} ({payment?.status || "PENDING"})
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-foreground">
                            {formatMoney(order.grandTotal)}
                          </p>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                          >
                            Inspect Order <ArrowUpRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Items Preview */}
                      {order.items.length > 0 && (
                        <div className="bg-muted/20 rounded-lg p-2.5 text-xs text-muted-foreground space-y-1">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="truncate max-w-xs font-medium text-foreground">
                                {item.variant.product.name} ({item.variant.color} / {item.variant.size})
                              </span>
                              <span className="font-mono text-xs">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-[10px] text-muted-foreground italic">
                              + {order.items.length - 3} more item(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Risk Scoring, Addresses, Activity */}
        <div className="space-y-6">
          {/* Risk Assessment Card */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldAlert size={16} /> Risk &amp; Fraud Score
              </h2>
              <span className={`text-xl font-black ${scoreColor(riskScore)}`}>
                {riskScore} / 100
              </span>
            </div>

            {/* Score Bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  riskScore >= 80
                    ? "bg-rose-600"
                    : riskScore >= 60
                    ? "bg-orange-500"
                    : riskScore >= 30
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Classification</span>
              <span className="font-bold uppercase tracking-wider text-foreground">
                {riskLevel} RISK
              </span>
            </div>

            {/* Signals */}
            {riskAssessment && riskAssessment.signals.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground">Detected Signals:</p>
                {riskAssessment.signals.map((s) => (
                  <div key={s.id} className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-md">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-medium">{s.label}</p>
                      {s.weight && (
                        <p className="text-[10px] text-rose-600">Weight: +{s.weight} pts</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-md">
                <ShieldCheck size={16} className="shrink-0" />
                <span>No negative risk signals detected. Clean transactional history.</span>
              </div>
            )}
          </div>

          {/* Account & Behavioral Summary */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 size={16} /> Behavioural Metrics
            </h2>

            <div className="divide-y divide-border/60">
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground">Account Verified</span>
                <span className="font-semibold text-foreground">
                  {customer.emailVerified ? "Yes (Email Verified)" : "Pending"}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground">Cancellation Frequency</span>
                <span className="font-semibold text-foreground">
                  {cancelledOrders.length} orders ({cancelRate}%)
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground">Return / Exchange Frequency</span>
                <span className="font-semibold text-foreground">
                  {returnOrders.length} orders ({returnRate}%)
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-muted-foreground">Customer Segment</span>
                <span className="font-semibold text-foreground">{customerSegment}</span>
              </div>
            </div>
          </div>

          {/* Saved Delivery Addresses */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin size={16} /> Saved Delivery Addresses ({customer.addresses.length})
            </h2>

            {customer.addresses.length === 0 ? (
              <p className="text-muted-foreground">No saved addresses on file.</p>
            ) : (
              <div className="space-y-2.5">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-lg border border-border p-3 bg-muted/10 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold text-stone-800">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{addr.line1}</p>
                    {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                    <p className="text-muted-foreground">
                      {addr.city}, {addr.postalCode || "Bangladesh"}
                    </p>
                    {addr.phone && (
                      <p className="text-muted-foreground font-mono text-[11px] pt-1">
                        Phone: {addr.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
