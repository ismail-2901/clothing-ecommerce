export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

function levelBadge(level: string) {
  switch (level) {
    case "CRITICAL": return <Badge variant="danger">Critical</Badge>;
    case "HIGH":     return <Badge variant="danger">High</Badge>;
    case "MEDIUM":   return <Badge variant="warning">Medium</Badge>;
    default:         return <Badge variant="muted">Low</Badge>;
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 30) return "text-amber-600";
  return "text-green-600";
}

const ACTION_LABEL: Record<string, string> = {
  HOLD: "Hold order. Contact customer before dispatch.",
  CONTACT_CUSTOMER: "Contact customer to confirm before dispatch.",
  REVIEW: "Standard processing. Monitor delivery.",
  APPROVE: "Low risk — standard fulfillment."
};

export default async function AdminRiskPage() {
  const session = await getServerSession();
  if (!session?.userId) redirect("/login");

  const userRoles = await prisma.userRole.findMany({
    where: { userId: session.userId },
    include: { role: true }
  });
  const isAdmin = userRoles.some((ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN");
  if (!isAdmin) redirect("/admin");

  const riskAssessments = await prisma.riskAssessment.findMany({
    where: {
      level: { in: ["MEDIUM", "HIGH", "CRITICAL"] },
      reviewedAt: null
    },
    orderBy: { score: "desc" },
    take: 50,
    include: {
      order: {
        select: { orderNumber: true, grandTotal: true, createdAt: true, status: true }
      },
      customer: {
        select: { id: true, name: true, email: true }
      },
      signals: true
    }
  });

  const critical = riskAssessments.filter((r) => r.level === "CRITICAL").length;
  const high = riskAssessments.filter((r) => r.level === "HIGH").length;
  const medium = riskAssessments.filter((r) => r.level === "MEDIUM").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Risk Center</h1>
        </div>
        <div className="flex gap-3">
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold text-red-600">{critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold text-orange-600">{high}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold text-amber-600">{medium}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
        <div className="flex gap-2">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-amber-800">
            Risk scores are advisory signals only. No order is automatically blocked.
            All actions require manual admin review and confirmation.
          </p>
        </div>
      </div>

      {riskAssessments.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <ShieldAlert size={40} className="text-muted-foreground" />
          <p className="font-semibold">No flagged orders</p>
          <p className="text-sm text-muted-foreground">All orders are within normal risk thresholds.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {riskAssessments.map((assessment) => (
            <article key={assessment.id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className={scoreColor(assessment.score)} />
                  <div>
                    <p className="font-semibold">{assessment.order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.customer?.name ?? "Guest"} · {assessment.customer?.email ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-semibold ${scoreColor(assessment.score)}`}>
                    {assessment.score}
                  </span>
                  {levelBadge(assessment.level)}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Risk signals</p>
                {assessment.signals.map((signal) => (
                  <div key={signal.id} className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                    {signal.label}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recommended action</p>
                <p className="mt-1.5 text-sm">
                  {ACTION_LABEL[assessment.recommendedAction] ?? assessment.recommendedAction}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                <p>
                  Order value: <strong>{formatMoney(assessment.order.grandTotal)}</strong> ·{" "}
                  {assessment.order.createdAt.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="flex gap-2">
                  {assessment.customer && (
                    <Link
                      href={`/admin/customers/${assessment.customer.id}`}
                      className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      View customer
                    </Link>
                  )}
                  <Link
                    href={`/admin/orders/${assessment.orderId}`}
                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-zinc-800"
                  >
                    View order
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
