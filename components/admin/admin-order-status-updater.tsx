"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { OrderStatus } from "@/features/orders/state-machine";

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
  FAILED_DELIVERY: ["CONFIRMED", "CANCELLED"],
};

const ACTION_BUTTON_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirm Order",
  PROCESSING: "Process Order",
  PACKED: "Mark as Packed",
  SHIPPED: "Dispatch & Ship",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark as Delivered",
  CANCELLED: "Cancel Order",
  RETURN_REQUESTED: "Request Return",
  RETURNED: "Confirm Returned",
  REFUNDED: "Process Refund",
  FAILED_DELIVERY: "Mark Delivery Failed",
};

export function AdminOrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const transitions = allowedTransitions[currentStatus] ?? [];

  async function handleTransition(newStatus: OrderStatus) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update order status.");
        setLoading(false);
        return;
      }

      setNote("");
      setShowNoteInput(false);
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (transitions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-5">
        <p className="text-sm font-medium">Order Status</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This order is in a terminal state ({currentStatus.toLowerCase()}) and cannot be transitioned further.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Update Status</p>
          <p className="text-xs text-muted-foreground">Current: {currentStatus}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNoteInput((prev) => !prev)}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          {showNoteInput ? "Hide note" : "Add note"}
        </button>
      </div>

      {showNoteInput && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="Optional status note (e.g. Courier Tracking ID)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus-visible:outline-none"
          />
        </div>
      )}

      {error && (
        <div className="mt-3 rounded border border-danger/20 bg-danger/10 p-2 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {transitions.map((st) => {
          const isDanger = st === "CANCELLED" || st === "FAILED_DELIVERY";
          return (
            <Button
              key={st}
              size="sm"
              variant={isDanger ? "outline" : "solid"}
              disabled={loading}
              onClick={() => handleTransition(st)}
              className={isDanger ? "border-danger text-danger hover:bg-danger/10" : ""}
            >
              {loading ? <Spinner size="sm" /> : ACTION_BUTTON_LABELS[st] || st}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
