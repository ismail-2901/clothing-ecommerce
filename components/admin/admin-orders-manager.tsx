"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  Check,
  ChevronRight,
  Filter,
  Ban,
  Clock,
  ArrowRight
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import {
  canTransitionOrderStatus,
  type OrderStatus
} from "@/features/orders/state-machine";
import { AdminOrderDocuments, type PrintableOrder } from "@/components/admin/admin-order-documents";
import { Spinner } from "@/components/ui/spinner";

export const statusMap: Record<string, { label: string; class: string }> = {
  DELIVERED: { label: "Delivered", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SHIPPED: { label: "Shipped", class: "bg-purple-50 text-purple-700 border-purple-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", class: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  PROCESSING: { label: "Processing", class: "bg-blue-50 text-blue-700 border-blue-200" },
  PACKED: { label: "Packed", class: "bg-sky-50 text-sky-700 border-sky-200" },
  CONFIRMED: { label: "Confirmed", class: "bg-teal-50 text-teal-700 border-teal-200" },
  PENDING: { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { label: "Cancelled", class: "bg-rose-50 text-rose-700 border-rose-200" },
  FAILED_DELIVERY: { label: "Failed Delivery", class: "bg-rose-50 text-rose-700 border-rose-200" },
  RETURN_REQUESTED: { label: "Return Requested", class: "bg-amber-50 text-amber-700 border-amber-200" },
  RETURNED: { label: "Returned", class: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  REFUNDED: { label: "Refunded", class: "bg-zinc-100 text-zinc-700 border-zinc-200" }
};

export const paymentBadgeStyle: Record<string, string> = {
  BKASH: "bg-pink-50 text-pink-700 border-pink-200",
  NAGAD: "bg-orange-50 text-orange-700 border-orange-200",
  CARD: "bg-blue-50 text-blue-700 border-blue-200",
  COD: "bg-zinc-100 text-zinc-700 border-zinc-200"
};

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone?: string | null;
  itemsCount: number;
  firstItem: string;
  total: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  date: string;
  time: string;
  rawDate: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  deliveryAddress?: Record<string, any> | null;
  customerSnapshot?: Record<string, any> | null;
  items: Array<{
    id: string;
    name: string;
    color?: string | null;
    size?: string | null;
    sku?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    productSnapshot?: Record<string, any> | null;
  }>;
  payments: Array<{
    provider?: string | null;
    status?: string | null;
    providerPaymentId?: string | null;
  }>;
};

export type StatusCounts = {
  ALL: number;
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  PACKED: number;
  SHIPPED: number;
  OUT_FOR_DELIVERY: number;
  DELIVERED: number;
  CANCELLED: number;
  RETURNS: number;
};

type BulkActionConfirmation = {
  targetStatus: OrderStatus;
  label: string;
  eligible: AdminOrderRow[];
  ineligible: { order: AdminOrderRow; reason: string }[];
};

type BulkExecutionResult = {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    id: string;
    orderNumber: string;
    success: boolean;
    error?: string;
    previousStatus?: OrderStatus;
    newStatus?: OrderStatus;
  }>;
};

export function AdminOrdersManager({
  orders,
  counts,
  currentStatus,
  searchQuery
}: {
  orders: AdminOrderRow[];
  counts: StatusCounts;
  currentStatus?: string;
  searchQuery?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk action modal & execution state
  const [confirmDialog, setConfirmDialog] = useState<BulkActionConfirmation | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkExecutionResult | null>(null);

  // Single-order printable document modal state
  const [activePrintOrder, setActivePrintOrder] = useState<PrintableOrder | null>(null);

  // Quick filter tabs
  const filterTabs = [
    { label: "All Orders", value: "", count: counts.ALL },
    { label: "Pending", value: "PENDING", count: counts.PENDING },
    { label: "Confirmed", value: "CONFIRMED", count: counts.CONFIRMED },
    { label: "Processing", value: "PROCESSING", count: counts.PROCESSING },
    { label: "Packed", value: "PACKED", count: counts.PACKED },
    { label: "Shipped", value: "SHIPPED", count: counts.SHIPPED },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY", count: counts.OUT_FOR_DELIVERY },
    { label: "Delivered", value: "DELIVERED", count: counts.DELIVERED },
    { label: "Cancelled", value: "CANCELLED", count: counts.CANCELLED },
    { label: "Returns / Refunds", value: "RETURNED", count: counts.RETURNS }
  ];

  // Selection helpers
  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Selected orders array
  const selectedOrders = useMemo(() => {
    return orders.filter((o) => selectedIds.has(o.id));
  }, [orders, selectedIds]);

  // Initiate bulk action with finite-state machine validation
  const promptBulkAction = (targetStatus: OrderStatus, label: string) => {
    const eligible: AdminOrderRow[] = [];
    const ineligible: { order: AdminOrderRow; reason: string }[] = [];

    for (const order of selectedOrders) {
      if (order.status === targetStatus) {
        ineligible.push({
          order,
          reason: `Already in status "${targetStatus}"`
        });
      } else if (!canTransitionOrderStatus(order.status, targetStatus)) {
        ineligible.push({
          order,
          reason: `Cannot transition from ${order.status} to ${targetStatus}`
        });
      } else {
        eligible.push(order);
      }
    }

    setBulkNote("");
    setConfirmDialog({
      targetStatus,
      label,
      eligible,
      ineligible
    });
  };

  // Execute bulk status transition
  const handleExecuteBulk = async () => {
    if (!confirmDialog || confirmDialog.eligible.length === 0) return;

    setIsExecuting(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: confirmDialog.eligible.map((o) => o.id),
          newStatus: confirmDialog.targetStatus,
          note: bulkNote.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk status update request failed.");
      }

      setBulkResult(data);
      setConfirmDialog(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to execute bulk operation");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-border/80 pb-3">
        {filterTabs.map((tab) => {
          const active = (currentStatus?.toUpperCase() || "") === tab.value;
          const queryParams = new URLSearchParams();
          if (searchQuery) queryParams.set("q", searchQuery);
          if (tab.value) queryParams.set("status", tab.value);
          const href = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

          return (
            <Link
              key={tab.label}
              href={href}
              className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Orders Table Container */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-xs">
          <ShoppingBag size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No orders found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            There are no customer orders matching your current filter or search criteria.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition shadow-xs"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          {/* Mobile Card Layout (Small Screens) */}
          <div className="sm:hidden divide-y divide-border/60">
            {orders.map((o) => {
              const isSelected = selectedIds.has(o.id);
              const statusInfo = statusMap[o.status] || {
                label: o.status,
                class: "bg-muted text-foreground border-border"
              };
              const paymentClass =
                paymentBadgeStyle[o.paymentMethod.toUpperCase()] ||
                "bg-zinc-100 text-zinc-700 border-zinc-200";

              return (
                <div
                  key={o.id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? "bg-blue-50/60 dark:bg-blue-950/20" : "hover:bg-muted/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(o.id)}
                        className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer"
                        aria-label={`Select order ${o.orderNumber}`}
                      />
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-sm font-bold text-foreground hover:underline"
                      >
                        #{o.orderNumber}
                      </Link>
                    </div>
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${statusInfo.class}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-foreground">{o.customer}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        {o.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{formatMoney(o.total)}</p>
                      <span
                        className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold ${paymentClass}`}
                      >
                        {o.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span>
                      {o.date} &bull; {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePrintOrder({
                            ...o,
                            createdAt: o.rawDate
                          })
                        }
                        title="Print Invoice / Consignment Slip"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                      >
                        <Printer size={12} />
                        <span>Print</span>
                      </button>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table with Frozen Sticky First Column */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-xs border-collapse">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground select-none">
                <tr className="h-11">
                  {/* Sticky Column: Select Checkbox + Order # */}
                  <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur-xs py-2.5 px-4 w-44 shadow-[1px_0_0_0_var(--admin-border,#e5e7eb)]">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer"
                        aria-label="Select all orders"
                      />
                      <span>Order #</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Date &amp; Time</th>
                  <th className="py-2.5 px-4 min-w-[180px]">Customer</th>
                  <th className="py-2.5 px-4 text-center">Items</th>
                  <th className="py-2.5 px-4">Payment</th>
                  <th className="py-2.5 px-4 text-center">Fulfillment Status</th>
                  <th className="py-2.5 px-4 text-right">Total (BDT)</th>
                  <th className="py-2.5 px-4 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((o) => {
                  const isSelected = selectedIds.has(o.id);
                  const statusInfo = statusMap[o.status] || {
                    label: o.status,
                    class: "bg-muted text-foreground border-border"
                  };
                  const paymentClass =
                    paymentBadgeStyle[o.paymentMethod.toUpperCase()] ||
                    "bg-zinc-100 text-zinc-700 border-zinc-200";

                  return (
                    <tr
                      key={o.id}
                      className={`h-11 transition-colors ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/20"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      {/* Sticky First Column */}
                      <td
                        className={`sticky left-0 z-10 py-2.5 px-4 font-mono font-bold text-foreground shadow-[1px_0_0_0_var(--admin-border,#e5e7eb)] ${
                          isSelected ? "bg-blue-50/90 dark:bg-blue-950/40" : "bg-background"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(o.id)}
                            className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer"
                            aria-label={`Select order ${o.orderNumber}`}
                          />
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="hover:underline tracking-tight"
                          >
                            #{o.orderNumber}
                          </Link>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                        <span className="font-medium text-foreground">{o.date}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{o.time}</span>
                      </td>

                      <td className="py-2.5 px-4">
                        <p className="font-bold text-foreground leading-tight">{o.customer}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[170px] leading-tight">
                          {o.email}
                        </p>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <span
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground inline-block"
                          title={o.firstItem}
                        >
                          {o.itemsCount} {o.itemsCount === 1 ? "pc" : "pcs"}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold ${paymentClass}`}
                          >
                            {o.paymentMethod}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                            {o.paymentStatus.toLowerCase()}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right font-black font-mono text-foreground whitespace-nowrap">
                        {formatMoney(o.total)}
                      </td>

                      <td className="py-2.5 px-4 text-right pr-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setActivePrintOrder({
                                ...o,
                                createdAt: o.rawDate
                              })
                            }
                            title="Generate Invoice or Courier Slip"
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted/40 transition"
                          >
                            <Printer size={12} />
                            <span>Slip</span>
                          </button>
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted/40 transition"
                          >
                            <Eye size={12} />
                            <span>View</span>
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

      {/* Floating Bottom Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-3xl w-[92vw] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-950/95 text-white px-5 py-3 shadow-2xl border border-zinc-700/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-black text-white font-mono">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-zinc-200">Selected</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-zinc-400 hover:text-white underline transition"
              >
                Clear
              </button>
            </div>

            {/* Quick Bulk Fulfillment Actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => promptBulkAction("CONFIRMED", "Confirm Orders")}
                className="rounded-lg bg-teal-600/90 hover:bg-teal-600 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => promptBulkAction("PROCESSING", "Process Orders")}
                className="rounded-lg bg-blue-600/90 hover:bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Process
              </button>
              <button
                type="button"
                onClick={() => promptBulkAction("PACKED", "Mark as Packed")}
                className="rounded-lg bg-sky-600/90 hover:bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Pack
              </button>
              <button
                type="button"
                onClick={() => promptBulkAction("SHIPPED", "Dispatch & Ship")}
                className="rounded-lg bg-purple-600/90 hover:bg-purple-600 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Ship
              </button>
              <button
                type="button"
                onClick={() => promptBulkAction("DELIVERED", "Mark as Delivered")}
                className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Deliver
              </button>
              <button
                type="button"
                onClick={() => promptBulkAction("CANCELLED", "Cancel Orders")}
                className="rounded-lg bg-rose-700/90 hover:bg-rose-700 px-2.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operation Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Bulk Operation: {confirmDialog.label}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Target status:{" "}
                  <span className="font-bold text-zinc-900 uppercase">
                    {confirmDialog.targetStatus}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Validation Breakdown */}
            <div className="space-y-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>
                    {confirmDialog.eligible.length} of {selectedIds.size} orders eligible
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {confirmDialog.eligible.map((o) => (
                    <span
                      key={o.id}
                      className="rounded bg-white/80 px-1.5 py-0.5 font-mono font-bold text-[10px] text-emerald-950 border border-emerald-300"
                    >
                      #{o.orderNumber} ({o.status})
                    </span>
                  ))}
                </div>
              </div>

              {confirmDialog.ineligible.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    <span>
                      {confirmDialog.ineligible.length} orders will be skipped (Incompatible status)
                    </span>
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-amber-800">
                    {confirmDialog.ineligible.map(({ order, reason }) => (
                      <li key={order.id} className="flex items-center justify-between">
                        <span className="font-mono font-bold">#{order.orderNumber}</span>
                        <span className="text-zinc-600">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Optional Batch Operational Note */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Batch Operational Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dispatched via Pathao batch #812, verified by phone"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                disabled={isExecuting}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulk}
                disabled={isExecuting || confirmDialog.eligible.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
              >
                {isExecuting ? <Spinner size="sm" /> : <Check size={13} />}
                <span>
                  Execute on {confirmDialog.eligible.length}{" "}
                  {confirmDialog.eligible.length === 1 ? "Order" : "Orders"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Execution Results Modal */}
      {bulkResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Bulk Execution Summary</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {bulkResult.succeeded} updated successfully &bull; {bulkResult.failed} skipped
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBulkResult(null);
                  clearSelection();
                }}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-200 text-xs">
              {bulkResult.results.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.success ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-zinc-900">#{r.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    {r.success ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {r.previousStatus} &rarr; {r.newStatus}
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-600 font-medium">{r.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  setBulkResult(null);
                  clearSelection();
                }}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition shadow-xs"
              >
                Dismiss &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single-Order Document Preview Modal */}
      {activePrintOrder && (
        <AdminOrderDocuments
          order={activePrintOrder}
          onClose={() => setActivePrintOrder(null)}
        />
      )}
    </div>
  );
}
