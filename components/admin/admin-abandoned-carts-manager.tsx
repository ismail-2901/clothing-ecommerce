"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Send,
  Mail,
  Clock,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  PackageCheck,
  Ban
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

export type AbandonedCheckoutItem = {
  id: string;
  cartId: string | null;
  customer: string;
  email: string | null;
  phone: string | null;
  stage: "CART" | "CONTACT" | "ADDRESS" | "SHIPPING" | "PAYMENT" | "REVIEW" | string;
  items: Array<{ name: string; variant?: string; quantity: number }>;
  value: number;
  lastSeen: string;
  lastSeenRaw: string;
  recovered: boolean;
  lastRecoverySentAt: string | null;
  recoveryAttemptsCount: number;
};

const STAGE_CONFIG: Record<
  string,
  { label: string; badge: string; stepNumber: number }
> = {
  CART: { label: "1. Cart Bag", badge: "bg-stone-100 text-stone-700 border-stone-200", stepNumber: 1 },
  CONTACT: { label: "2. Contact Info", badge: "bg-blue-50 text-blue-700 border-blue-200", stepNumber: 2 },
  ADDRESS: { label: "3. Delivery Address", badge: "bg-amber-50 text-amber-700 border-amber-200", stepNumber: 3 },
  SHIPPING: { label: "4. Shipping Method", badge: "bg-orange-50 text-orange-700 border-orange-200", stepNumber: 4 },
  PAYMENT: { label: "5. Payment Gate", badge: "bg-purple-50 text-purple-700 border-purple-200", stepNumber: 5 },
  REVIEW: { label: "6. Final Review", badge: "bg-rose-50 text-rose-700 border-rose-200", stepNumber: 6 }
};

export function AdminAbandonedCartsManager({
  checkouts: initialCheckouts,
  channels
}: {
  checkouts: AbandonedCheckoutItem[];
  channels: {
    email: { available: boolean; provider: string };
    sms: { available: boolean; provider: string };
  };
}) {
  const [checkouts, setCheckouts] = useState<AbandonedCheckoutItem[]>(initialCheckouts);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [selectedCheckout, setSelectedCheckout] = useState<AbandonedCheckoutItem | null>(null);

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: "success" | "error" | "warn" } | null>(
    null
  );

  const totalValue = checkouts.reduce((sum, c) => sum + c.value, 0);
  const totalCount = checkouts.length;
  const avgValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
  const paymentDropoffCount = checkouts.filter(
    (c) => c.stage === "PAYMENT" || c.stage === "REVIEW"
  ).length;

  const handleSendRecovery = async (item: AbandonedCheckoutItem, force = false) => {
    if (!item.email) {
      setFeedback({
        id: item.id,
        msg: "No email address on file for this guest checkout session.",
        type: "error"
      });
      return;
    }

    if (!channels.email.available) {
      setFeedback({
        id: item.id,
        msg: "Email provider is unavailable. Cannot dispatch recovery message.",
        type: "error"
      });
      return;
    }

    setSendingId(item.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/abandoned-checkouts/${item.id}/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force })
      });

      const data = await res.json();

      if (res.status === 409 && data.canForce) {
        if (
          confirm(
            `${data.error}\n\nLast dispatched on ${new Date(data.lastSent).toLocaleString()}.\n\nDo you want to FORCE re-send another recovery email?`
          )
        ) {
          await handleSendRecovery(item, true);
          return;
        } else {
          setSendingId(null);
          return;
        }
      }

      if (!res.ok) {
        setFeedback({
          id: item.id,
          msg: data.error || "Failed to dispatch recovery message.",
          type: "error"
        });
        setSendingId(null);
        return;
      }

      // Successful dispatch
      const nowIso = new Date().toISOString();
      setCheckouts((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                lastRecoverySentAt: nowIso,
                recoveryAttemptsCount: c.recoveryAttemptsCount + 1
              }
            : c
        )
      );

      setFeedback({
        id: item.id,
        msg: `Recovery email dispatched via ${channels.email.provider} to ${data.recipient}.`,
        type: "success"
      });

      setTimeout(() => setFeedback(null), 5000);
    } catch {
      setFeedback({
        id: item.id,
        msg: "Network connection error while dispatching recovery email.",
        type: "error"
      });
    } finally {
      setSendingId(null);
    }
  };

  const filtered = checkouts.filter((c) => {
    const matchesSearch =
      c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm));
    const matchesStage = stageFilter === "ALL" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Abandoned Checkout Recovery
            </h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Sessions
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Analyze checkout drop-off stages and dispatch verified recovery communications
          </p>
        </div>

        {/* Channel Status Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <Mail size={12} className="text-emerald-600" />
            <span>Email ({channels.email.provider}) Live</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
            <Smartphone size={12} className="text-stone-500" />
            <span>SMS Unconfigured</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Recoverable Revenue</p>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(totalValue)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Potential checkout pipeline</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Abandoned Sessions</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Recorded drop-off sessions</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Average Cart Value</p>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(avgValue)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Per abandoned session</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">High-Intent Payment Drop-Offs</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{paymentDropoffCount}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
              High Intent
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Left during bKash/Card/Review step</p>
        </div>
      </div>

      {/* Channel Governance Notice */}
      <div className="rounded-xl border border-border bg-muted/15 p-4 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 text-foreground font-semibold">
          <AlertCircle size={14} className="text-muted-foreground" />
          <span>Operational Recovery Policy</span>
        </div>
        <p>
          Recovery links are sent exclusively via verified email ({channels.email.provider}). Duplicate recovery attempts within a 24-hour window require explicit supervisor confirmation. SMS dispatch is disabled because no SMS gateway is currently provisioned.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-background p-4 shadow-xs">
        <div className="relative w-full lg:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search shopper, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Funnel Stage Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { label: "All Stages", value: "ALL" },
            { label: "Cart Page", value: "CART" },
            { label: "Contact Info", value: "CONTACT" },
            { label: "Address", value: "ADDRESS" },
            { label: "Shipping", value: "SHIPPING" },
            { label: "Payment Gate", value: "PAYMENT" },
            { label: "Final Review", value: "REVIEW" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStageFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                stageFilter === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold animate-in fade-in ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Abandoned Checkouts Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-xs">
          <ShoppingCart size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No abandoned checkouts found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No shopping sessions currently match your funnel filter or search query.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Shopper</th>
                  <th className="py-3 px-4">Funnel Drop-Off Stage</th>
                  <th className="py-3 px-4">Cart Contents</th>
                  <th className="py-3 px-4 text-right">Value (BDT)</th>
                  <th className="py-3 px-4 text-right">Last Activity</th>
                  <th className="py-3 px-4 text-center">Recovery Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => {
                  const stageInfo = STAGE_CONFIG[c.stage] || {
                    label: c.stage,
                    badge: "bg-muted text-foreground border-border",
                    stepNumber: 0
                  };
                  const isSending = sendingId === c.id;
                  const hasEmail = Boolean(c.email);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCheckout(c)}
                      className="hover:bg-muted/15 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground text-xs uppercase">
                            {c.customer.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{c.customer}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {c.email || c.phone || "Guest (no email)"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${stageInfo.badge}`}
                        >
                          {stageInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-foreground truncate">
                          {c.items[0]?.name}
                          {c.items[0]?.variant && (
                            <span className="text-muted-foreground"> ({c.items[0].variant})</span>
                          )}
                        </p>
                        {c.items.length > 1 && (
                          <p className="text-[10px] text-muted-foreground">
                            + {c.items.length - 1} more selection(s)
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-foreground whitespace-nowrap">
                        {formatMoney(c.value)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {c.lastSeen}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {c.lastRecoverySentAt ? (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            <Send size={10} /> Dispatched ({c.recoveryAttemptsCount})
                          </span>
                        ) : hasEmail ? (
                          <span className="inline-block rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-muted/60 border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            No Email
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={isSending || !hasEmail}
                            onClick={() => handleSendRecovery(c)}
                            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                              hasEmail
                                ? "bg-foreground text-background hover:bg-foreground/90 shadow-xs"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                            }`}
                            title={
                              hasEmail
                                ? "Dispatch recovery email"
                                : "No email associated with guest session"
                            }
                          >
                            <Send size={11} className={isSending ? "animate-pulse" : ""} />
                            <span>{isSending ? "Sending..." : "Recover"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCheckout(c)}
                            className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                          >
                            View
                          </button>
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

      {/* Slide-out Drawer: Detailed Cart & Funnel Breakdown */}
      {selectedCheckout && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="h-full w-full max-w-md bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 space-y-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">Abandoned Bag Detail</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ID: {selectedCheckout.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCheckout(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shopper:</span>
                  <span className="font-bold text-foreground">{selectedCheckout.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedCheckout.email || "Not captured"}
                  </span>
                </div>
                {selectedCheckout.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-mono text-foreground">{selectedCheckout.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Active:</span>
                  <span className="text-foreground">{selectedCheckout.lastSeen}</span>
                </div>
              </div>

              {/* Funnel Progress */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Funnel Drop-Off Step</p>
                <div className="rounded-xl border border-border p-3.5 bg-muted/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {STAGE_CONFIG[selectedCheckout.stage]?.label || selectedCheckout.stage}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                      STAGE_CONFIG[selectedCheckout.stage]?.badge
                    }`}
                  >
                    Stage {STAGE_CONFIG[selectedCheckout.stage]?.stepNumber || 1} of 6
                  </span>
                </div>
              </div>

              {/* Items in Cart */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">
                    Items in Cart ({selectedCheckout.items.length})
                  </span>
                  <span className="font-black text-foreground">
                    {formatMoney(selectedCheckout.value)}
                  </span>
                </div>
                <div className="divide-y divide-border/60 rounded-xl border border-border bg-background p-3 text-xs space-y-2">
                  {selectedCheckout.items.map((it, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">{it.name}</p>
                        {it.variant && (
                          <p className="text-[11px] text-muted-foreground">{it.variant}</p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-muted-foreground">
                        &times;{it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery History */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-foreground">Recovery Dispatch History</p>
                {selectedCheckout.lastRecoverySentAt ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Send size={12} /> Dispatched via Email
                    </p>
                    <p className="text-[11px]">
                      Last attempt on:{" "}
                      {new Date(selectedCheckout.lastRecoverySentAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-blue-700">
                      Total attempts recorded: {selectedCheckout.recoveryAttemptsCount}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No recovery communications have been dispatched for this session yet.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center gap-2">
              <button
                type="button"
                disabled={!selectedCheckout.email || sendingId === selectedCheckout.id}
                onClick={() => handleSendRecovery(selectedCheckout)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-xs font-bold text-background hover:bg-foreground/90 transition disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} />
                <span>
                  {sendingId === selectedCheckout.id
                    ? "Dispatching..."
                    : selectedCheckout.lastRecoverySentAt
                    ? "Re-send Recovery Email"
                    : "Dispatch Recovery Email"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCheckout(null)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
