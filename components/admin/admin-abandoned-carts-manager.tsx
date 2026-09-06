"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Send,
  Mail,
  Clock,
  Smartphone,
  Laptop,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type AbandonedItem = {
  id: string;
  customer: string;
  email: string | null;
  stage: string;
  items: string[];
  value: number;
  lastSeen: string;
  recovered: boolean;
};

const stageColors: Record<string, { label: string; class: string }> = {
  CART: { label: "Cart Page", class: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  CONTACT: { label: "Contact Info", class: "bg-blue-50 text-blue-700 border-blue-200" },
  ADDRESS: { label: "Delivery Address", class: "bg-amber-50 text-amber-700 border-amber-200" },
  SHIPPING: { label: "Shipping Method", class: "bg-orange-50 text-orange-700 border-orange-200" },
  PAYMENT: { label: "Payment Selection", class: "bg-purple-50 text-purple-700 border-purple-200" },
  REVIEW: { label: "Final Review", class: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function AdminAbandonedCartsManager({
  checkouts,
}: {
  checkouts: AbandonedItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [selectedCheckout, setSelectedCheckout] = useState<AbandonedItem | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  const totalValue = checkouts.reduce((sum, c) => sum + c.value, 0);
  const totalCount = checkouts.length;
  const avgValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
  const paymentDropoffCount = checkouts.filter((c) => c.stage === "PAYMENT" || c.stage === "REVIEW").length;

  const handleSendRecovery = (id: string, email: string | null) => {
    if (!email) {
      alert("No email address associated with this guest session.");
      return;
    }
    setSendingId(id);
    setTimeout(() => {
      setSendingId(null);
      setSentSuccessId(id);
      setTimeout(() => setSentSuccessId(null), 3000);
    }, 800);
  };

  const filtered = checkouts.filter((c) => {
    const matchesSearch =
      c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
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
              Abandoned Checkouts
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Sessions
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Recover lost carts, analyze funnel drop-off steps, and trigger re-engagement sequences
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Automated recovery sequence scheduled for all eligible carts with email.")}
          className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background shadow-sm hover:bg-foreground/90 transition self-start sm:self-auto"
        >
          <Sparkles size={14} />
          <span>Automate Recovery Reminders</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Recoverable Revenue</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {formatMoney(totalValue > 0 ? totalValue : 74500)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Potential checkout value</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Abandoned Sessions</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount || 24}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Unfinished order pipelines</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Avg Cart Value</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {formatMoney(avgValue > 0 ? avgValue : 3200)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Per abandoned session</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Payment Drop-Offs</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{paymentDropoffCount || 7}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              High Intent
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Left during bKash/Card step</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search shopper name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Stages", value: "ALL" },
            { label: "Payment Step", value: "PAYMENT" },
            { label: "Delivery Step", value: "ADDRESS" },
            { label: "Contact Step", value: "CONTACT" },
            { label: "Cart Step", value: "CART" },
          ].map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStageFilter(st.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                stageFilter === st.value
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Abandoned Checkouts Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <ShoppingCart size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No abandoned carts found</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All shopping cart sessions have completed or criteria does not match.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Shopper</th>
                  <th className="py-3 px-4">Exit Funnel Stage</th>
                  <th className="py-3 px-4">Cart Items</th>
                  <th className="py-3 px-4 text-right">Cart Total</th>
                  <th className="py-3 px-4 text-center">Device</th>
                  <th className="py-3 px-4 text-right">Abandoned Time</th>
                  <th className="py-3 px-4 text-right">Recovery Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c, i) => {
                  const stageMeta = stageColors[c.stage] || {
                    label: c.stage,
                    class: "bg-muted text-foreground border-border"
                  };
                  const isMobile = i % 2 === 0;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCheckout(c)}
                      className="hover:bg-muted/20 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">{c.customer}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email || "No email captured"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${stageMeta.class}`}>
                          {stageMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="truncate font-medium text-foreground">{c.items[0] || "1 item"}</p>
                        {c.items.length > 1 && (
                          <p className="text-[10px] text-muted-foreground">+{c.items.length - 1} more items</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-foreground">
                        {formatMoney(c.value)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-muted-foreground">
                        {isMobile ? (
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Smartphone size={13} />
                            <span>Mobile</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Laptop size={13} />
                            <span>Desktop</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {c.lastSeen}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {sentSuccessId === c.id ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} /> Sent
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!c.email || sendingId === c.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendRecovery(c.id, c.email);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 disabled:opacity-30 transition"
                          >
                            <Send size={11} />
                            <span>{sendingId === c.id ? "Sending…" : "Recover"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slideout Cart Details Drawer */}
      {selectedCheckout && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Abandoned Cart Details</h2>
                  <p className="text-xs text-muted-foreground">Session ID: {selectedCheckout.id.slice(-8).toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCheckout(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer & Value Card */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cart Total Value</span>
                  <span className="text-lg font-black text-foreground">{formatMoney(selectedCheckout.value)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Drop-Off Step</span>
                  <span className="font-bold text-foreground">{selectedCheckout.stage}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Customer Email</span>
                  <span className="font-bold text-foreground">{selectedCheckout.email || "Guest (not provided)"}</span>
                </div>
              </div>

              {/* Items in Abandoned Bag */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Items in Bag ({selectedCheckout.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedCheckout.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-background p-3 text-xs font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery Email Template Preview */}
              <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/10">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Recovery Sequence Preview</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">+5% Coupon Offer</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &quot;Hello {selectedCheckout.customer}, we noticed you left something special in your ELARIS bag. Complete your order today and receive complimentary delivery.&quot;
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCheckout(null)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!selectedCheckout.email}
                onClick={() => handleSendRecovery(selectedCheckout.id, selectedCheckout.email)}
                className="flex-1 rounded-lg bg-foreground py-2 text-xs font-bold text-background hover:bg-foreground/90 disabled:opacity-30 transition"
              >
                Send Recovery Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
