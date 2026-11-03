"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  canTransitionOrderStatus,
  type OrderStatus
} from "@/features/orders/state-machine";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  X,
  FileText,
  RotateCcw
} from "lucide-react";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "FAILED_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "REFUNDED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
  FAILED_DELIVERY: ["CONFIRMED", "CANCELLED"]
};

const ACTION_LABELS: Record<OrderStatus, string> = {
  PENDING: "Set Pending",
  CONFIRMED: "Confirm Order",
  PROCESSING: "Send to Processing",
  PACKED: "Mark as Packed",
  SHIPPED: "Dispatch & Ship",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Confirm Delivered",
  CANCELLED: "Cancel Order",
  RETURN_REQUESTED: "Request Return",
  RETURNED: "Confirm Returned",
  REFUNDED: "Process Refund",
  FAILED_DELIVERY: "Mark Delivery Failed"
};

const SUGGESTED_NOTES: Record<OrderStatus, string[]> = {
  CONFIRMED: ["Customer verified via phone call", "Payment confirmed", "Address verified"],
  PROCESSING: ["Items picked from warehouse", "Tailoring / sizing check complete"],
  PACKED: ["Packed in Elaris branded parcel", "Ready for courier handover"],
  SHIPPED: ["Handed over to courier rider", "Consignment manifest generated"],
  OUT_FOR_DELIVERY: ["Rider assigned for same-day delivery", "Customer notified by SMS"],
  DELIVERED: ["Cash collected & parcel handed to customer", "Signed proof of delivery"],
  CANCELLED: ["Customer requested cancellation", "Unreachable by phone after 3 attempts", "Duplicate order"],
  FAILED_DELIVERY: ["Customer phone unreachable", "Address incomplete", "Customer refused parcel at door"],
  RETURN_REQUESTED: ["Customer requested size exchange", "Damaged in transit claim"],
  RETURNED: ["Parcel received back at Dhaka warehouse", "Inspected and restocked"],
  REFUNDED: ["Online payment refunded to source account", "Store credit voucher issued"],
  PENDING: ["Re-opened for review"]
};

export function AdminOrderStatusUpdater({
  orderId,
  currentStatus
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null);

  const transitions = allowedTransitions[currentStatus] ?? [];

  async function executeTransition(newStatus: OrderStatus) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          note: note.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update order status.");
        setLoading(false);
        return;
      }

      setNote("");
      setShowNoteInput(false);
      setConfirmTarget(null);
      router.refresh();
    } catch {
      setError("Network error occurred while updating order status.");
    } finally {
      setLoading(false);
    }
  }

  const handleActionClick = (target: OrderStatus) => {
    // If destructive (Cancel or Refund or Failed Delivery), show confirmation first
    const isDestructive =
      target === "CANCELLED" || target === "REFUNDED" || target === "FAILED_DELIVERY";

    if (isDestructive) {
      setConfirmTarget(target);
      setShowNoteInput(true);
    } else {
      void executeTransition(target);
    }
  };

  if (transitions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
        <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          Fulfillment Status
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-bold uppercase text-foreground">
            {currentStatus}
          </span>
          <span className="text-xs text-muted-foreground">Terminal state (no further actions)</span>
        </div>
      </div>
    );
  }

  // Separate primary progression from alternative/destructive actions
  const primaryAction = transitions.find(
    (st) => st !== "CANCELLED" && st !== "FAILED_DELIVERY" && st !== "REFUNDED"
  );
  const secondaryActions = transitions.filter((st) => st !== primaryAction);

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Update Fulfillment
          </p>
          <p className="text-xs text-foreground font-semibold mt-0.5">
            Current: <span className="font-bold uppercase">{currentStatus}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNoteInput((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-foreground underline transition"
        >
          {showNoteInput ? "Hide note" : "Add operational note"}
        </button>
      </div>

      {/* Note input field & quick suggestion chips */}
      {showNoteInput && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
          <label className="block text-[11px] font-semibold text-foreground">
            Operational Note / Courier Tracking
          </label>
          <input
            type="text"
            placeholder="e.g. Dispatched via Steadfast ID #8921, verified by agent..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
          />

          {/* Quick Note Suggestions */}
          {primaryAction && SUGGESTED_NOTES[primaryAction] && (
            <div className="flex flex-wrap gap-1 pt-1">
              {SUGGESTED_NOTES[primaryAction].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setNote(sug)}
                  className="rounded border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  + {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {primaryAction && (
          <Button
            size="sm"
            variant="solid"
            disabled={loading}
            onClick={() => handleActionClick(primaryAction)}
            className="font-bold text-xs shadow-xs"
          >
            {loading ? <Spinner size="sm" /> : <ArrowRight size={13} className="mr-1.5" />}
            <span>{ACTION_LABELS[primaryAction] || primaryAction}</span>
          </Button>
        )}

        {secondaryActions.map((st) => {
          const isDanger = st === "CANCELLED" || st === "FAILED_DELIVERY";
          return (
            <Button
              key={st}
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => handleActionClick(st)}
              className={
                isDanger
                  ? "border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                  : "text-xs font-semibold"
              }
            >
              {loading ? <Spinner size="sm" /> : null}
              <span>{ACTION_LABELS[st] || st}</span>
            </Button>
          );
        })}
      </div>

      {/* Destructive Action Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={18} />
                <h3 className="text-base font-bold text-zinc-950">
                  Confirm {ACTION_LABELS[confirmTarget]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to transition this order to{" "}
              <span className="font-bold uppercase text-zinc-900">{confirmTarget}</span>? This will
              update the fulfillment ledger and adjust inventory reservations accordingly.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Reason / Operational Note
              </label>
              <input
                type="text"
                placeholder="e.g. Customer cancelled via phone call..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={loading}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => executeTransition(confirmTarget)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-xs"
              >
                {loading ? <Spinner size="sm" /> : null}
                <span>Proceed with {ACTION_LABELS[confirmTarget]}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
