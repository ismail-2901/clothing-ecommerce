"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Search,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  Package,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/utils/money";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import type { BulkInventoryResult } from "@/app/api/admin/inventory/bulk/route";

export type AdminInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  reserved: number;
  price: number;
  isAvailable: boolean;
};

type BulkConfirmMode = "ADD" | "SET";

type BulkConfirmState = {
  mode: BulkConfirmMode;
  quantity: number;
  reason: string;
  eligible: Array<{ variant: AdminInventoryRow; newStock: number }>;
  ineligible: Array<{ variant: AdminInventoryRow; reason: string }>;
};

type BulkExecutionState = {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkInventoryResult[];
};

export function AdminInventoryManager({
  variants,
  totalSKUs,
  inStockCount,
  lowStockCount,
  outOfStockCount,
  lowStockThreshold = 5,
  currentStatus,
  searchQuery,
  page = 1,
  totalPages = 1
}: {
  variants: AdminInventoryRow[];
  totalSKUs: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockThreshold?: number;
  currentStatus?: string;
  searchQuery?: string;
  page?: number;
  totalPages?: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Multi-SKU selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogMode, setBulkDialogMode] = useState<BulkConfirmMode | null>(null);
  const [bulkQtyInput, setBulkQtyInput] = useState<number | "">("");
  const [bulkReasonInput, setBulkReasonInput] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<BulkConfirmState | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkExecutionState | null>(null);
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);

  // Inline stock editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | "">("");
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [justUpdatedId, setJustUpdatedId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<"name" | "sku" | "stock" | "available">("stock");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const pageVariantIds = useMemo(() => variants.map((v) => v.id), [variants]);
  const isAllPageSelected =
    pageVariantIds.length > 0 && pageVariantIds.every((id) => selectedIds.has(id));
  const isPartiallySelected =
    pageVariantIds.some((id) => selectedIds.has(id)) && !isAllPageSelected;

  function toggleSelectAllPage() {
    if (isAllPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageVariantIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageVariantIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleVariantSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Handle opening inline editor
  function handleStartInlineEdit(variant: AdminInventoryRow) {
    setEditingId(variant.id);
    setEditValue(variant.stock);
    setInlineError(null);
  }

  function handleCancelInlineEdit() {
    setEditingId(null);
    setEditValue("");
    setInlineError(null);
  }

  async function handleSaveInlineEdit(variant: AdminInventoryRow) {
    if (editValue === "" || Number(editValue) < 0) {
      setInlineError("Stock must be 0 or greater");
      return;
    }

    const newStock = Number(editValue);
    if (newStock < variant.reserved) {
      setInlineError(`Cannot be less than reserved units (${variant.reserved})`);
      return;
    }

    if (newStock === variant.stock) {
      handleCancelInlineEdit();
      return;
    }

    setIsSavingInline(true);
    setInlineError(null);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          stockQuantity: newStock,
          expectedCurrentStock: variant.stock
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setInlineError(data.error || "Failed to update stock");
        setIsSavingInline(false);
        return;
      }

      setJustUpdatedId(variant.id);
      setTimeout(() => setJustUpdatedId(null), 2500);
      handleCancelInlineEdit();

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setInlineError("Network error occurred");
    } finally {
      setIsSavingInline(false);
    }
  }

  // Handle bulk action preparation
  function prepareBulkAction(mode: BulkConfirmMode) {
    const qty = Number(bulkQtyInput);
    if (!qty && qty !== 0) {
      alert("Please provide a valid quantity.");
      return;
    }

    const selectedVariants = variants.filter((v) => selectedIds.has(v.id));
    const eligible: Array<{ variant: AdminInventoryRow; newStock: number }> = [];
    const ineligible: Array<{ variant: AdminInventoryRow; reason: string }> = [];

    selectedVariants.forEach((v) => {
      const projected = mode === "SET" ? qty : v.stock + qty;
      if (projected < 0) {
        ineligible.push({
          variant: v,
          reason: `Resulting stock (${projected}) would be negative`
        });
      } else if (projected < v.reserved) {
        ineligible.push({
          variant: v,
          reason: `Resulting stock (${projected}) would be less than reserved quantity (${v.reserved})`
        });
      } else {
        eligible.push({ variant: v, newStock: projected });
      }
    });

    setConfirmDialog({
      mode,
      quantity: qty,
      reason: bulkReasonInput.trim(),
      eligible,
      ineligible
    });
    setBulkDialogMode(null);
  }

  // Execute bulk action
  async function handleExecuteBulk() {
    if (!confirmDialog) return;
    setIsBulkExecuting(true);

    try {
      const res = await fetch("/api/admin/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: confirmDialog.eligible.map(({ variant }) => ({
            variantId: variant.id,
            mode: confirmDialog.mode,
            quantity: confirmDialog.quantity
          })),
          reason: confirmDialog.reason || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Bulk inventory operation failed.");
        setIsBulkExecuting(false);
        return;
      }

      setConfirmDialog(null);
      setBulkResult(data);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      alert("Network error executing bulk inventory update.");
    } finally {
      setIsBulkExecuting(false);
    }
  }

  // Sorted variants
  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.productName.localeCompare(b.productName);
      } else if (sortField === "sku") {
        comparison = a.sku.localeCompare(b.sku);
      } else if (sortField === "stock") {
        comparison = a.stock - b.stock;
      } else if (sortField === "available") {
        comparison = Math.max(0, a.stock - a.reserved) - Math.max(0, b.stock - b.reserved);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [variants, sortField, sortOrder]);

  function toggleSort(field: "name" | "sku" | "stock" | "available") {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  const outOfStockList = variants.filter((v) => v.stock === 0);
  const lowStockList = variants.filter((v) => v.stock > 0 && v.stock <= lowStockThreshold);

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Inventory Management
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground dark:text-white">
              {totalSKUs} SKUs Tracked
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Monitor real-time warehouse stock levels, variant SKUs, and perform inline stock adjustments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/export/inventory"
            download
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
          <Button asChild className="text-xs h-8">
            <Link href="/admin/products/new">
              <Plus size={14} /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total SKUs Tracked</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalSKUs}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active variant inventory</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Healthy In-Stock</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{inStockCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {totalSKUs > 0 ? Math.round((inStockCount / totalSKUs) * 100) : 100}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Sufficient stock levels</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Low Stock (≤{lowStockThreshold})</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{lowStockCount}</span>
            {lowStockCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Alert
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Needs replenishment</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{outOfStockCount}</span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Urgent
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Sales blocked on storefront</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="w-full sm:max-w-md">
          <AdminSearchInput placeholder="Search SKU, product name, color, size…" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All", value: "" },
            { label: "In Stock", value: "in" },
            { label: "Low Stock", value: "low" },
            { label: "Out of Stock", value: "out" },
          ].map((tab) => {
            const active = (currentStatus || "") === tab.value;
            const qp = new URLSearchParams();
            if (searchQuery) qp.set("q", searchQuery);
            if (tab.value) qp.set("status", tab.value);
            const href = `/admin/inventory${qp.toString() ? `?${qp.toString()}` : ""}`;

            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Inventory Table */}
      {sortedVariants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <Boxes size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No inventory records found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || currentStatus
              ? "No variant SKUs matched your active filter or search criteria."
              : "Try adjusting your search criteria or add new variants to your catalog."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {(searchQuery || currentStatus) && (
              <Button asChild variant="outline" className="text-xs">
                <Link href="/admin/inventory">Clear Filters</Link>
              </Button>
            )}
            <Button asChild className="text-xs">
              <Link href="/admin/products/new">Add Product</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          {/* Header Action Row when items selected */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {selectedIds.size} of {variants.length} SKU(s) selected
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-border/60">
            {sortedVariants.map((v) => {
              const available = Math.max(0, v.stock - v.reserved);
              const isOutOfStock = v.stock === 0;
              const isLowStock = v.stock > 0 && v.stock <= lowStockThreshold;
              const isSelected = selectedIds.has(v.id);
              const isEditing = editingId === v.id;
              const isJustUpdated = justUpdatedId === v.id;

              return (
                <div
                  key={v.id}
                  className={`p-4 space-y-3 transition ${
                    isJustUpdated ? "bg-emerald-50/60" : isSelected ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleVariantSelection(v.id)}
                        className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${v.productId}/edit`}
                          className="font-bold text-sm text-foreground hover:underline truncate block"
                        >
                          {v.productName}
                        </Link>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          SKU: {v.sku}
                        </p>
                      </div>
                    </div>

                    {isOutOfStock ? (
                      <span className="inline-block rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 shrink-0">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                        Low Stock ({v.stock})
                      </span>
                    ) : (
                      <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize font-semibold text-foreground">{v.color}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-bold text-[10px] text-foreground">
                        {v.size}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        Reserved: <strong>{v.reserved}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Available: <strong className="text-foreground">{available}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Inline Edit Row on Mobile */}
                  {isEditing ? (
                    <div className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Update On-Hand Stock:
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditValue((prev) => Math.max(v.reserved, Number(prev || 0) + 5))}
                            className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold hover:bg-muted/80"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditValue((prev) => Math.max(v.reserved, Number(prev || 0) + 10))}
                            className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold hover:bg-muted/80"
                          >
                            +10
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={v.reserved}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value ? Number(e.target.value) : "")}
                          className="h-9 w-full rounded border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={isSavingInline}
                          onClick={() => handleSaveInlineEdit(v)}
                          className="rounded bg-foreground px-3 py-2 text-xs font-bold text-background hover:bg-foreground/90 disabled:opacity-50"
                        >
                          {isSavingInline ? <Spinner size="sm" /> : <Check size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelInlineEdit}
                          className="rounded border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {inlineError && (
                        <p className="text-[11px] text-rose-600 font-semibold">{inlineError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <button
                        type="button"
                        onClick={() => handleStartInlineEdit(v)}
                        className="inline-flex items-center gap-1 rounded border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted transition"
                      >
                        <Edit2 size={12} />
                        <span>Edit Stock: {v.stock}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/products/${v.productId}/edit`}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="Edit Product"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table with 44px rows */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground h-11">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={toggleSelectAllPage}
                      className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                    />
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("sku")}
                  >
                    <div className="flex items-center gap-1">
                      <span>SKU</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Variant</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("stock")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>In Stock</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Reserved</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("available")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Available</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedVariants.map((v) => {
                  const available = Math.max(0, v.stock - v.reserved);
                  const isOutOfStock = v.stock === 0;
                  const isLowStock = v.stock > 0 && v.stock <= lowStockThreshold;
                  const isSelected = selectedIds.has(v.id);
                  const isEditing = editingId === v.id;
                  const isJustUpdated = justUpdatedId === v.id;

                  return (
                    <tr
                      key={v.id}
                      className={`h-11 transition hover:bg-muted/20 ${
                        isJustUpdated ? "bg-emerald-50/60" : isSelected ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleVariantSelection(v.id)}
                          className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                        />
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-foreground">
                        <Link
                          href={`/admin/products/${v.productId}/edit`}
                          className="hover:underline line-clamp-1"
                        >
                          {v.productName}
                        </Link>
                      </td>

                      <td className="py-2.5 px-4 font-mono font-medium text-foreground/80">
                        {v.sku}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="capitalize font-medium text-foreground">{v.color}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-bold text-[10px] text-foreground">
                            {v.size}
                          </span>
                        </div>
                      </td>

                      {/* In Stock Cell with Inline Editing */}
                      <td className="py-2.5 px-4 text-center">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min={v.reserved}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value ? Number(e.target.value) : "")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit(v);
                                if (e.key === "Escape") handleCancelInlineEdit();
                              }}
                              className="h-7 w-16 rounded border border-foreground bg-background px-1.5 text-center text-xs font-bold text-foreground focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={isSavingInline}
                              onClick={() => handleSaveInlineEdit(v)}
                              className="rounded bg-foreground p-1 text-background hover:bg-foreground/90 disabled:opacity-50"
                              title="Save stock"
                            >
                              {isSavingInline ? <Spinner size="sm" /> : <Check size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelInlineEdit}
                              className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(v)}
                            className="group inline-flex items-center gap-1 rounded px-2 py-1 font-bold text-foreground hover:bg-muted transition"
                            title="Click to edit stock quantity directly"
                          >
                            <span>{v.stock}</span>
                            <Edit2 size={11} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        )}
                        {isEditing && inlineError && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                            {inlineError}
                          </p>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-center text-muted-foreground">
                        {v.reserved}
                      </td>

                      <td className="py-2.5 px-4 text-center font-extrabold text-foreground">
                        {available}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-block rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Low Stock ({v.stock})
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(v)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            title="Edit Stock Quantity"
                          >
                            <Edit2 size={13} />
                          </button>
                          <Link
                            href={`/admin/products/${v.productId}/edit`}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            title="Edit Product Details"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
              <span className="text-muted-foreground">
                Showing page <strong className="text-foreground">{page}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const qp = new URLSearchParams(window.location.search);
                    qp.set("page", String(page - 1));
                    router.push(`/admin/inventory?${qp.toString()}`);
                  }}
                  className="h-8 text-xs"
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const qp = new URLSearchParams(window.location.search);
                    qp.set("page", String(page + 1));
                    router.push(`/admin/inventory?${qp.toString()}`);
                  }}
                  className="h-8 text-xs"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Toolbar for Multi-SKU Selection */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
              {selectedIds.size} SKUs Selected
            </span>

            <div className="h-4 w-px bg-white/20" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setBulkDialogMode("ADD");
                  setBulkQtyInput(10);
                  setBulkReasonInput("Warehouse restock batch");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <Plus size={13} />
                <span>Restock (+Units)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBulkDialogMode("SET");
                  setBulkQtyInput(20);
                  setBulkReasonInput("Inventory recount adjustment");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
              >
                <Edit2 size={13} />
                <span>Set Exact Stock</span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/20" />

            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Bulk Quantity Prompt Dialog */}
      {bulkDialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {bulkDialogMode === "ADD" ? "Bulk Replenishment (+Units)" : "Bulk Stock Set"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Target: {selectedIds.size} selected SKUs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkDialogMode(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">
                  {bulkDialogMode === "ADD" ? "Units to add to each SKU:" : "Exact stock for each SKU:"}
                </label>
                <input
                  type="number"
                  min={bulkDialogMode === "ADD" ? 1 : 0}
                  value={bulkQtyInput}
                  onChange={(e) => setBulkQtyInput(e.target.value ? Number(e.target.value) : "")}
                  placeholder={bulkDialogMode === "ADD" ? "e.g. 15" : "e.g. 50"}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">
                  Adjustment Reason / Note:
                </label>
                <input
                  type="text"
                  value={bulkReasonInput}
                  onChange={(e) => setBulkReasonInput(e.target.value)}
                  placeholder="e.g. Received new shipment batch from supplier"
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setBulkDialogMode(null)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => prepareBulkAction(bulkDialogMode)}
                className="rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                Continue &rarr;
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
                  Confirm Bulk Stock Update
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Action:{" "}
                  <strong className="text-zinc-900">
                    {confirmDialog.mode === "ADD"
                      ? `Add +${confirmDialog.quantity} units`
                      : `Set to ${confirmDialog.quantity} units`}
                  </strong>
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
                    {confirmDialog.eligible.length} of {selectedIds.size} SKUs eligible for update
                  </span>
                </p>
                <div className="mt-1 max-h-36 overflow-y-auto space-y-1 text-[11px]">
                  {confirmDialog.eligible.map(({ variant, newStock }) => (
                    <div key={variant.id} className="flex items-center justify-between font-mono">
                      <span>{variant.sku}</span>
                      <span>
                        {variant.stock} &rarr; <strong>{newStock}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {confirmDialog.ineligible.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    <span>
                      {confirmDialog.ineligible.length} SKUs will be skipped
                    </span>
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-amber-800">
                    {confirmDialog.ineligible.map(({ variant, reason }) => (
                      <li key={variant.id} className="flex items-center justify-between">
                        <span className="font-mono font-bold">{variant.sku}</span>
                        <span className="text-zinc-600">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                disabled={isBulkExecuting}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulk}
                disabled={isBulkExecuting || confirmDialog.eligible.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
              >
                {isBulkExecuting ? <Spinner size="sm" /> : <Check size={13} />}
                <span>
                  Execute on {confirmDialog.eligible.length}{" "}
                  {confirmDialog.eligible.length === 1 ? "SKU" : "SKUs"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Results Summary Dialog */}
      {bulkResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Bulk Execution Summary</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {bulkResult.succeeded} updated &bull; {bulkResult.failed} skipped
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

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100 text-xs">
              {bulkResult.results.map((r) => (
                <div key={r.variantId} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-zinc-900">{r.sku}</span>
                    {r.previousStock !== undefined && r.newStock !== undefined && (
                      <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                        {r.previousStock} &rarr; {r.newStock}
                      </span>
                    )}
                  </div>
                  <div>
                    {r.success ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Check size={10} /> Success
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200"
                        title={r.error}
                      >
                        Failed: {r.error}
                      </span>
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
                className="rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Restock Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h2 className="text-sm font-bold text-foreground">Low Stock Restock Queue</h2>
            </div>
            <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              {lowStockList.length} Variants
            </span>
          </div>

          {lowStockList.length === 0 ? (
            <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              No variants currently below threshold (≤{lowStockThreshold})
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockList.slice(0, 5).map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.productName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.sku} &bull; {item.color} / {item.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-600">{item.stock} in stock</span>
                    <button
                      type="button"
                      onClick={() => handleStartInlineEdit(item)}
                      className="rounded bg-foreground px-2 py-1 text-[11px] font-bold text-background hover:bg-foreground/90 transition"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-rose-600" />
              <h2 className="text-sm font-bold text-foreground">Out of Stock Items</h2>
            </div>
            <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              {outOfStockList.length} SKUs
            </span>
          </div>

          {outOfStockList.length === 0 ? (
            <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              Zero out-of-stock items. Inventory health is 100%!
            </div>
          ) : (
            <div className="space-y-2.5">
              {outOfStockList.slice(0, 5).map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.productName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {item.sku} &bull; {item.color} / {item.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-600">0 in stock</span>
                    <button
                      type="button"
                      onClick={() => handleStartInlineEdit(item)}
                      className="rounded bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition"
                    >
                      Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

