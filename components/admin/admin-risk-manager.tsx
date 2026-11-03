"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ShieldCheck,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Eye,
  AlertCircle
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

export type RiskItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  orderStatus: string;
  orderDate: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendedAction: "HOLD" | "CONTACT_CUSTOMER" | "REVIEW" | "APPROVE" | string;
  summary: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  signals: Array<{
    id: string;
    label: string;
    weight: number;
  }>;
};

const ACTION_CONFIG: Record<
  string,
  { label: string; badge: string; desc: string }
> = {
  HOLD: {
    label: "Urgent Hold",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    desc: "Hold parcel dispatch immediately. Verify identity and call customer before courier handover."
  },
  CONTACT_CUSTOMER: {
    label: "Contact Customer",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    desc: "Verify Bangladeshi mobile number (+880) via phone call or SMS confirmation."
  },
  REVIEW: {
    label: "Monitor Review",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Standard fulfillment with courier tracking alert. Inspect delivery address."
  },
  APPROVE: {
    label: "Standard Approval",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Low behavioural risk. Proceed with standard warehouse packing and dispatch."
  }
};

function scoreBadge(score: number, level: string) {
  if (score >= 80 || level === "CRITICAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <ShieldAlert size={11} /> {score} Critical
      </span>
    );
  }
  if (score >= 60 || level === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
        <AlertTriangle size={11} /> {score} High Risk
      </span>
    );
  }
  if (score >= 30 || level === "MEDIUM") {
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

export function AdminRiskManager({
  initialAssessments,
  totalAssessed,
  criticalCount,
  highCount,
  mediumCount
}: {
  initialAssessments: RiskItem[];
  totalAssessed: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}) {
  const [assessments, setAssessments] = useState<RiskItem[]>(initialAssessments);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [expandedSignals, setExpandedSignals] = useState<Record<string, boolean>>({});
  const [reviewingItem, setReviewingItem] = useState<RiskItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; msg: string } | null>(null);

  const toggleSignals = (id: string) => {
    setExpandedSignals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmReview = async () => {
    if (!reviewingItem) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/admin/risk/${reviewingItem.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionTaken: reviewingItem.recommendedAction,
          notes: reviewNotes.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to record review");
        setSubmittingReview(false);
        return;
      }

      const nowIso = new Date().toISOString();
      setAssessments((prev) =>
        prev.map((item) =>
          item.id === reviewingItem.id
            ? {
                ...item,
                reviewedAt: nowIso,
                summary: reviewNotes
                  ? `${item.summary ? item.summary + " | " : ""}Review note: ${reviewNotes}`
                  : item.summary
              }
            : item
        )
      );

      setFeedbackMsg({
        id: reviewingItem.id,
        msg: `Order #${reviewingItem.orderNumber} successfully verified & logged.`
      });
      setTimeout(() => setFeedbackMsg(null), 4000);

      setReviewingItem(null);
      setReviewNotes("");
    } catch {
      alert("Network error submitting risk review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filtered = assessments.filter((r) => {
    const matchesSearch =
      r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.customerPhone && r.customerPhone.includes(searchTerm));

    let matchesLevel = true;
    if (levelFilter === "CRITICAL") matchesLevel = r.level === "CRITICAL";
    else if (levelFilter === "HIGH") matchesLevel = r.level === "HIGH";
    else if (levelFilter === "MEDIUM") matchesLevel = r.level === "MEDIUM";
    else if (levelFilter === "CLEAN") matchesLevel = r.level === "LOW";
    else if (levelFilter === "UNREVIEWED") matchesLevel = !r.reviewedAt;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Risk &amp; Fraud Management Center
            </h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalAssessed} COD Assessed
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Behavioural risk assessment for Cash on Delivery (COD) orders. Enforce operational directives before dispatch.
          </p>
        </div>
      </div>

      {/* 4 KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Critical Risk Flagged</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{criticalCount}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
              Urgent Hold
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">High likelihood of courier refusal or scam</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">High Risk Orders</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-600">{highCount}</span>
            <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
              Call Required
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Multiple negative behavioral signals</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Medium Risk Reviews</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{mediumCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Manual Check
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Elevated cart velocity or new buyer</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total COD Orders Scored</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalAssessed}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Scored during checkout creation</p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-xs">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="space-y-1">
          <p className="font-bold">Algorithmic Signals &amp; Operational Governance:</p>
          <p className="leading-relaxed text-amber-800">
            Signals measured: failed deliveries (+22), repeated COD refusals (+18), cancellation frequency 90d (+16), return frequency 180d (+12), payment failures 30d (+12), cart velocity 24h (+10), and order value far exceeding customer historical average (+10). All scoring is strictly deterministic and preserved. Sensitive manual review decisions are logged immutably in the audit trail.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-background p-4 shadow-xs">
        <div className="relative w-full lg:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order #, customer, phone, or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { label: "All Orders", value: "ALL" },
            { label: "Critical", value: "CRITICAL" },
            { label: "High Risk", value: "HIGH" },
            { label: "Medium", value: "MEDIUM" },
            { label: "Clean", value: "CLEAN" },
            { label: "Pending Review", value: "UNREVIEWED" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setLevelFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                levelFilter === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{feedbackMsg.msg}</span>
        </div>
      )}

      {/* Main Risk Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-xs">
          <ShieldCheck size={40} className="text-emerald-600 mb-3" />
          <h2 className="text-base font-bold text-foreground">No matching risk assessments</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No COD orders match your current search query or risk filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Operational Directive</th>
                  <th className="py-3 px-4">Signals Detected</th>
                  <th className="py-3 px-4 text-right">Order Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => {
                  const directive = ACTION_CONFIG[r.recommendedAction] || {
                    label: r.recommendedAction,
                    badge: "bg-muted text-foreground border-border",
                    desc: "Standard verification"
                  };
                  const isExpanded = !!expandedSignals[r.id];

                  return (
                    <tr key={r.id} className="hover:bg-muted/15 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        <Link
                          href={`/admin/orders/${r.orderId}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          #{r.orderNumber}
                          <ExternalLink size={10} className="text-muted-foreground" />
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-sans block">
                          {r.orderDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">{r.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {r.customerPhone || r.customerEmail}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {scoreBadge(r.score, r.level)}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${directive.badge}`}
                          title={directive.desc}
                        >
                          {directive.label}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {directive.desc}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {r.signals.length === 0 ? (
                          <span className="text-muted-foreground text-[11px] italic">
                            Clean transaction
                          </span>
                        ) : (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {r.signals.slice(0, isExpanded ? r.signals.length : 2).map((s) => (
                                <span
                                  key={s.id}
                                  className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700"
                                >
                                  {s.label} (+{s.weight})
                                </span>
                              ))}
                            </div>
                            {r.signals.length > 2 && (
                              <button
                                type="button"
                                onClick={() => toggleSignals(r.id)}
                                className="text-[10px] text-muted-foreground hover:text-foreground mt-1 flex items-center gap-0.5 cursor-pointer font-semibold"
                              >
                                {isExpanded ? (
                                  <>
                                    Show less <ChevronUp size={11} />
                                  </>
                                ) : (
                                  <>
                                    +{r.signals.length - 2} more signals <ChevronDown size={11} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-foreground whitespace-nowrap">
                        {formatMoney(r.orderTotal)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {r.reviewedAt ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingItem(r);
                              setReviewNotes("");
                            }}
                            className={`rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                              r.reviewedAt
                                ? "border border-border text-muted-foreground hover:text-foreground"
                                : "bg-foreground text-background hover:bg-foreground/90 shadow-xs"
                            }`}
                          >
                            {r.reviewedAt ? "Re-evaluate" : "Review Directive"}
                          </button>
                          <Link
                            href={`/admin/orders/${r.orderId}`}
                            className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                            title="Inspect Order Details"
                          >
                            Order
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Directive Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Order Risk Verification
                </h2>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  #{reviewingItem.orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Directive Alert */}
            <div
              className={`rounded-xl border p-4 text-xs space-y-2 ${
                reviewingItem.recommendedAction === "HOLD"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : reviewingItem.recommendedAction === "CONTACT_CUSTOMER"
                  ? "bg-orange-50 border-orange-200 text-orange-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert size={15} /> Operational Directive: {reviewingItem.recommendedAction}
                </span>
                <span className="font-extrabold text-sm">{reviewingItem.score} pts</span>
              </div>
              <p className="leading-relaxed">
                {ACTION_CONFIG[reviewingItem.recommendedAction]?.desc ||
                  "Review order details and verify customer identity before proceeding."}
              </p>
            </div>

            {/* Customer & Order Context */}
            <div className="rounded-xl border border-border p-3.5 bg-muted/15 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-bold text-foreground">{reviewingItem.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Phone:</span>
                <span className="font-mono font-bold text-foreground">
                  {reviewingItem.customerPhone || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Value:</span>
                <span className="font-bold text-foreground">
                  {formatMoney(reviewingItem.orderTotal)}
                </span>
              </div>
              {reviewingItem.reviewedAt && (
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground">Previous Review:</span>
                  <span className="text-emerald-700 font-semibold">
                    {new Date(reviewingItem.reviewedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Signals Triggered */}
            {reviewingItem.signals.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-foreground">Triggered Fraud Signals:</p>
                <div className="space-y-1">
                  {reviewingItem.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex items-center justify-between rounded bg-muted/30 px-2.5 py-1 text-muted-foreground"
                    >
                      <span>{sig.label}</span>
                      <span className="font-mono font-bold text-rose-600">+{sig.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Notes Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-foreground">
                Staff Verification Notes (Recorded to Audit Trail):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Called customer at +88017... confirmed address in Gulshan, approved for courier dispatch."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                disabled={submittingReview}
                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={submittingReview}
                className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition disabled:opacity-50"
              >
                {submittingReview ? "Recording..." : "Confirm Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

