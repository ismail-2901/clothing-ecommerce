export const dynamic = "force-dynamic";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, ShieldAlert, AlertTriangle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/db/prisma";

type PageProps = { params: Promise<{ id: string }> };

function scoreColor(score: number) {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 30) return "text-amber-600";
  return "text-green-600";
}

function statusBadge(status: string) {
  switch (status) {
    case "DELIVERED": return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY": return <Badge variant="warning">In transit</Badge>;
    case "CANCELLED":
    case "RETURNED":
    case "FAILED_DELIVERY": return <Badge variant="danger">{status.replace(/_/g, " ").toLowerCase()}</Badge>;
    default: return <Badge variant="muted">{status.replace(/_/g, " ").toLowerCase()}</Badge>;
  }
}

function categoryBadge(category: string) {
  switch (category) {
    case "HIGH_VALUE": return <Badge variant="success">High value</Badge>;
    case "AT_RISK":
    case "CANCEL_HEAVY":
    case "RETURN_HEAVY":
    case "DELIVERY_FAILURE_RISK": return <Badge variant="danger">{category.replace(/_/g, " ").toLowerCase()}</Badge>;
    default: return <Badge variant="muted">{category.replace(/_/g, " ").toLowerCase()}</Badge>;
  }
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
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

  const customer = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { select: { id: true } } }
      },
      riskAssessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { signals: true }
      },
      addresses: { where: { deletedAt: null }, orderBy: { isDefault: "desc" } },
      roles: { include: { role: true } }
    }
  });

  if (!customer) notFound();

  const orders = customer.orders;
  const totalSpend = orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.grandTotal, 0);
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const returnCount = orders.filter((o) => ["RETURN_REQUESTED", "RETURNED"].includes(o.status)).length;
  const avgOrderValue = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + o.grandTotal, 0) / orders.length) : 0;

  const riskAssessment = customer.riskAssessments[0];

  // Simple customer category
  let customerCategory = "NEW";
  if (orders.length >= 5 && cancelledCount / orders.length > 0.4) customerCategory = "CANCEL_HEAVY";
  else if (orders.length >= 5 && returnCount / orders.length > 0.4) customerCategory = "RETURN_HEAVY";
  else if (totalSpend >= 5000000) customerCategory = "HIGH_VALUE";
  else if (orders.length >= 3 && deliveredCount > 0) customerCategory = "REPEAT";
  else if (orders.length >= 1) customerCategory = "ACTIVE";

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Customers
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin · Customer</p>
          <h1 className="mt-1 text-2xl font-semibold">{customer.name ?? customer.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
          {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
        </div>
        {categoryBadge(customerCategory)}
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total orders", value: orders.length },
          { label: "Delivered", value: deliveredCount },
          { label: "Total spend", value: formatMoney(totalSpend) },
          { label: "Avg. order", value: formatMoney(avgOrderValue) }
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <p className="font-semibold flex items-center gap-2"><Package size={16} /> Recent orders</p>
            </div>
            {orders.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40 transition"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item(s) · {order.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatMoney(order.grandTotal)}</span>
                      {statusBadge(order.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk + info */}
        <div className="space-y-4">
          {/* Account info */}
          <div className="rounded-lg border border-border bg-background p-5">
            <p className="font-semibold flex items-center gap-2"><BarChart3 size={16} /> Account</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{customer.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span>{customer.emailVerified ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancellations</span>
                <span>{cancelledCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Returns</span>
                <span>{returnCount}</span>
              </div>
            </div>
          </div>

          {/* Risk */}
          {riskAssessment && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="font-semibold flex items-center gap-2"><ShieldAlert size={16} /> Risk</p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`text-2xl font-semibold ${scoreColor(riskAssessment.score)}`}>
                  {riskAssessment.score}
                </span>
                <span className="text-sm text-muted-foreground capitalize">{riskAssessment.level.toLowerCase()}</span>
              </div>
              {riskAssessment.signals.map((s) => (
                <div key={s.id} className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" /> {s.label}
                </div>
              ))}
            </div>
          )}

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="font-semibold">Saved addresses</p>
              <div className="mt-3 space-y-3">
                {customer.addresses.slice(0, 2).map((addr) => (
                  <div key={addr.id} className="text-sm text-muted-foreground">
                    <p className="text-foreground font-medium">{addr.name}</p>
                    <p>{addr.line1}, {addr.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
