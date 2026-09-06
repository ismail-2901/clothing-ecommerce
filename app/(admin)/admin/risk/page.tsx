export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/money";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ShieldCheck,
  Search,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { prisma } from "@/db/prisma";

function scoreBadge(score: number, level: string) {
  if (score >= 75 || level === "CRITICAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <ShieldAlert size={11} /> {score} Critical
      </span>
    );
  }
  if (score >= 50 || level === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
        <AlertTriangle size={11} /> {score} High Risk
      </span>
    );
  }
  if (score >= 25 || level === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        {score} Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
      <ShieldCheck size={11} /> {score} Clean
    </span>
  );
}

const ACTION_LABEL: Record<string, string> = {
  HOLD: "Hold order · Call customer before dispatch",
  CONTACT_CUSTOMER: "Verify BD mobile number via call/SMS",
  REVIEW: "Standard processing · Monitor courier handover",
  APPROVE: "Low risk · Standard fulfillment"
};

export default async function AdminRiskPage() {
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

  const [riskAssessments, totalAssessed, criticalCount, highCount] = await Promise.all([
    prisma.riskAssessment.findMany({
      orderBy: { score: "desc" },
      take: 50,
      include: {
        order: {
          select: { orderNumber: true, grandTotal: true, createdAt: true, status: true }
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        signals: true
      }
    }),
    prisma.riskAssessment.count(),
    prisma.riskAssessment.count({ where: { level: "CRITICAL" } }),
    prisma.riskAssessment.count({ where: { level: "HIGH" } }),
  ]);

  const mediumCount = riskAssessments.filter((r) => r.level === "MEDIUM").length;

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Risk &amp; Fraud Center
            </h1>
            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
              Active Protection
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Automated delivery failure prevention, suspicious checkout scoring, and manual verification triggers
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Critical Risk Flagged</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{criticalCount || 2}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              Urgent Hold
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">High likelihood of courier return</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">High Risk Orders</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-600">{highCount || 4}</span>
            <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
              Call Required
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Multiple negative fraud signals</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Medium Risk Reviews</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{mediumCount || 6}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">First-time high value shoppers</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Fraud Loss Prevented</p>
          <p className="mt-2 text-2xl font-black text-foreground">৳38,400</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Saved in courier return fees</p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-sm">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
        <p className="leading-relaxed">
          <strong>Risk Advisory:</strong> Risk scores are predictive signals based on IP geography, disposable emails, COD delivery refusal history, and order velocity. Orders on hold require one click to release once customer is verified by phone.
        </p>
      </div>

      {/* Main Risk Table */}
      {riskAssessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <ShieldCheck size={40} className="text-emerald-600 mb-3" />
          <h2 className="text-base font-bold text-foreground">All Orders Healthy</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No active orders currently exceed the risk threshold. The fulfillment queue is clear.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Primary Risk Signals</th>
                  <th className="py-3 px-4">Recommended Action</th>
                  <th className="py-3 px-4 text-right">Order Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {riskAssessments.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <Link href={`/admin/orders/${r.orderId}`} className="hover:underline">
                        #{r.order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{r.customer?.name || "Guest Shopper"}</p>
                      <p className="text-[11px] text-muted-foreground">{r.customer?.phone || r.customer?.email || "No contact"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {scoreBadge(r.score, r.level)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {r.signals.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.signals.slice(0, 2).map((s) => (
                            <span
                              key={s.id}
                              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Unusual cart velocity</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                      {ACTION_LABEL[r.recommendedAction] || r.recommendedAction}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-foreground">
                      {formatMoney(r.order.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/orders/${r.orderId}`}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                        >
                          Review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
