"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  PackageSearch,
  Pencil,
  Eye,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArrowRight,
  Globe,
  FileEdit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/utils/money";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import { AdminCategoryFilter } from "@/components/admin/admin-category-filter";
import type { ProductStatus } from "@prisma/client";
import type { BulkProductStatusResult } from "@/app/api/admin/products/bulk-status/route";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  categoryId?: string;
  parentCategory: string | null;
  variantsCount: number;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  status: ProductStatus;
};

export type CategoryHierarchyOption = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Array<{ id: string; name: string }>;
};

type BulkConfirmState = {
  targetStatus: ProductStatus;
  label: string;
  eligible: AdminProductRow[];
  ineligible: { product: AdminProductRow; reason: string }[];
};

type BulkExecutionState = {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkProductStatusResult[];
};

export function AdminProductsManager({
  products,
  totalCount,
  publishedCount,
  draftCount,
  lowStockCount,
  allCategories,
  currentStatus,
  searchQuery,
  currentCategory,
  page = 1,
  totalPages = 1
}: {
  products: AdminProductRow[];
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  lowStockCount: number;
  allCategories: CategoryHierarchyOption[];
  currentStatus?: string;
  searchQuery?: string;
  currentCategory?: string;
  page?: number;
  totalPages?: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<BulkConfirmState | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkExecutionState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [bulkNote, setBulkNote] = useState("");

  const pageProductIds = useMemo(() => products.map((p) => p.id), [products]);
  const isAllPageSelected =
    pageProductIds.length > 0 && pageProductIds.every((id) => selectedIds.has(id));
  const isPartiallySelected =
    pageProductIds.some((id) => selectedIds.has(id)) && !isAllPageSelected;

  function toggleSelectAllPage() {
    if (isAllPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageProductIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageProductIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleProductSelection(id: string) {
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

  function handleInitiateBulk(targetStatus: ProductStatus, label: string) {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    const eligible: AdminProductRow[] = [];
    const ineligible: { product: AdminProductRow; reason: string }[] = [];

    selectedProducts.forEach((p) => {
      if (p.status === targetStatus) {
        ineligible.push({
          product: p,
          reason: `Already ${targetStatus.toLowerCase()}`
        });
      } else {
        eligible.push(p);
      }
    });

    setBulkNote("");
    setConfirmDialog({
      targetStatus,
      label,
      eligible,
      ineligible
    });
  }

  async function handleExecuteBulk() {
    if (!confirmDialog) return;
    setIsExecuting(true);

    try {
      const res = await fetch("/api/admin/products/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: confirmDialog.eligible.map((p) => p.id),
          newStatus: confirmDialog.targetStatus,
          note: bulkNote.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Bulk status update failed.");
        setIsExecuting(false);
        return;
      }

      setConfirmDialog(null);
      setBulkResult(data);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      alert("Network error executing bulk product status update.");
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Products Catalog
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground dark:text-white">
              {totalCount} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage clothing collections, descriptions, variants, pricing, and live availability
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/export/products"
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
          <p className="text-xs font-medium text-muted-foreground">Total Catalog</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">All listed styles</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Published &amp; Live</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{publishedCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Visible on storefront</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Draft Pieces</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{draftCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Unpublished
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">In review or staging</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Low / Zero Stock</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{lowStockCount}</span>
            {lowStockCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Warning
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Variants need restock</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-md">
            <AdminSearchInput placeholder="Search product name, slug, SKU, category…" />
          </div>
          <AdminCategoryFilter categories={allCategories as any} />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All", value: "" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Drafts", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" },
          ].map((tab) => {
            const active = (currentStatus?.toUpperCase() || "") === tab.value;
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.set("q", searchQuery);
            if (currentCategory) queryParams.set("category", currentCategory);
            if (tab.value) queryParams.set("status", tab.value);
            const href = `/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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

      {/* Main Products Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <PackageSearch size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No products found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || currentStatus || currentCategory
              ? "No catalog items matched your active search or filter criteria. Try clearing filters."
              : "Get started by adding your first clothing piece with custom sizes, colors, pricing, and stock."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {(searchQuery || currentStatus || currentCategory) && (
              <Button asChild variant="outline" className="text-xs">
                <Link href="/admin/products">Clear Filters</Link>
              </Button>
            )}
            <Button asChild className="text-xs">
              <Link href="/admin/products/new">
                <Plus size={14} /> Add First Product
              </Link>
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
                  {selectedIds.size} of {products.length} product(s) selected
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

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-border/60">
            {products.map((p) => {
              const isPublished = p.status === "PUBLISHED";
              const isDraft = p.status === "DRAFT";
              const isSelected = selectedIds.has(p.id);

              return (
                <div
                  key={p.id}
                  className={`p-4 space-y-3 transition ${
                    isSelected ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(p.id)}
                        className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                      />
                      <div className="relative h-12 w-10 overflow-hidden rounded border border-border bg-muted shrink-0">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="font-bold text-sm text-foreground hover:underline truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          /{p.slug}
                        </p>
                      </div>
                    </div>
                    {isPublished ? (
                      <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                        PUBLISHED
                      </span>
                    ) : isDraft ? (
                      <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                        DRAFT
                      </span>
                    ) : (
                      <span className="inline-block rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 shrink-0">
                        ARCHIVED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                    <div>
                      <span className="text-muted-foreground">
                        {p.parentCategory ? `${p.parentCategory} / ` : ""}
                        {p.category}
                      </span>
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                        {p.variantsCount} {p.variantsCount === 1 ? "var" : "vars"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-foreground">
                        {p.minPrice === p.maxPrice
                          ? formatMoney(p.minPrice)
                          : `${formatMoney(p.minPrice)} – ${formatMoney(p.maxPrice)}`}
                      </span>
                      <span
                        className={`ml-2 text-[11px] font-bold ${
                          p.totalStock === 0
                            ? "text-rose-600"
                            : p.totalStock <= 5
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({p.totalStock} in stock)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <Link
                      href="/shop"
                      target="_blank"
                      aria-label={`View ${p.name} on storefront`}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="View on Storefront"
                    >
                      <Eye size={13} />
                      <span>Storefront</span>
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      aria-label={`Edit ${p.name}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                      title="Edit Product"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: 44px Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
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
                      title="Select all products on page"
                    />
                  </th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Variants</th>
                  <th className="py-3 px-4">Price Range</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => {
                  const isPublished = p.status === "PUBLISHED";
                  const isDraft = p.status === "DRAFT";
                  const isSelected = selectedIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`h-11 transition hover:bg-muted/20 ${
                        isSelected ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(p.id)}
                          className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-7 overflow-hidden rounded border border-border bg-muted shrink-0">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-foreground hover:underline line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        {p.parentCategory ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {p.parentCategory}
                            </span>
                            <span className="font-medium text-foreground">
                              {p.category}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-foreground">{p.category}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                          {p.variantsCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-extrabold text-foreground">
                        {p.minPrice === p.maxPrice
                          ? formatMoney(p.minPrice)
                          : `${formatMoney(p.minPrice)} – ${formatMoney(p.maxPrice)}`}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`font-bold ${
                            p.totalStock === 0
                              ? "text-rose-600"
                              : p.totalStock <= 5
                              ? "text-amber-600"
                              : "text-foreground"
                          }`}
                        >
                          {p.totalStock}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {isPublished ? (
                          <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            PUBLISHED
                          </span>
                        ) : isDraft ? (
                          <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            DRAFT
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                            ARCHIVED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/shop"
                            target="_blank"
                            aria-label={`View ${p.name} on storefront`}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            title="View on Storefront"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            aria-label={`Edit ${p.name}`}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            title="Edit Product"
                          >
                            <Pencil size={14} />
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.name} />
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
                    router.push(`/admin/products?${qp.toString()}`);
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
                    router.push(`/admin/products?${qp.toString()}`);
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

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
              {selectedIds.size} Selected
            </span>

            <div className="h-4 w-px bg-white/20" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleInitiateBulk("PUBLISHED", "Activate (Publish)")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <Globe size={13} />
                <span>Publish</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateBulk("DRAFT", "Deactivate (Draft)")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition"
              >
                <FileEdit size={13} />
                <span>Set Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleInitiateBulk("ARCHIVED", "Archive Products")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
              >
                <Archive size={13} />
                <span>Archive</span>
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

      {/* Bulk Status Confirmation Dialog */}
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
                    {confirmDialog.eligible.length} of {selectedIds.size} products eligible
                  </span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {confirmDialog.eligible.map((p) => (
                    <span
                      key={p.id}
                      className="rounded bg-white/80 px-1.5 py-0.5 font-bold text-[10px] text-emerald-950 border border-emerald-300"
                    >
                      {p.name} ({p.status})
                    </span>
                  ))}
                </div>
              </div>

              {confirmDialog.ineligible.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    <span>
                      {confirmDialog.ineligible.length} products will be skipped (Already in target status)
                    </span>
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-amber-800">
                    {confirmDialog.ineligible.map(({ product, reason }) => (
                      <li key={product.id} className="flex items-center justify-between">
                        <span className="font-bold">{product.name}</span>
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
                placeholder="e.g. Seasonal transition to Spring 2026 collection"
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
                  {confirmDialog.eligible.length === 1 ? "Product" : "Products"}
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

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100 text-xs">
              {bulkResult.results.map((r) => (
                <div key={r.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900">{r.name || r.id}</span>
                    {r.previousStatus && r.newStatus && (
                      <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                        {r.previousStatus} &rarr; {r.newStatus}
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
    </div>
  );
}

