export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import {
  Plus,
  PackageSearch,
  Pencil,
  Eye,
  Download,
  Filter,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/db/prisma";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import type { ProductStatus } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { q, status } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (status && ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status.toUpperCase())) {
    whereClause.status = status.toUpperCase() as ProductStatus;
  }

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { variants: { some: { sku: { contains: term, mode: "insensitive" } } } },
    ];
  }

  const [dbProducts, totalCount, publishedCount, draftCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } },
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        variants: {
          where: { deletedAt: null },
          select: { id: true, sku: true, color: true, size: true, priceOverride: true, stockQuantity: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.product.count({ where: { status: "DRAFT", deletedAt: null } }),
  ]);

  const products = dbProducts.map((p) => {
    const prices = p.variants.map((v) => v.priceOverride ?? p.basePrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;
    const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const image = p.images[0]?.url || "/elaris-women.jpg";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image,
      category: p.category?.name || "Uncategorized",
      variantsCount: p.variants.length,
      minPrice,
      maxPrice,
      totalStock,
      status: p.status
    };
  });

  const lowStockCount = products.filter((p) => p.totalStock <= 5).length;

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Products Catalog
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage clothing collections, descriptions, variants, pricing, and live availability
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <Button asChild className="text-xs h-8">
            <Link href="/admin/products/new">
              <Plus size={14} /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <div className="w-full sm:max-w-md">
          <AdminSearchInput placeholder="Search product name, slug, SKU…" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All", value: "" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Drafts", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" },
          ].map((tab) => {
            const active = (status?.toUpperCase() || "") === tab.value;
            const queryParams = new URLSearchParams();
            if (q) queryParams.set("q", q);
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
            Get started by adding your first clothing piece with custom sizes, colors, pricing, and stock.
          </p>
          <Button asChild className="mt-4 text-xs">
            <Link href="/admin/products/new">
              <Plus size={14} /> Add First Product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
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

                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-8 overflow-hidden rounded border border-border bg-muted shrink-0">
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
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                          {p.variantsCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-foreground">
                        {p.minPrice === p.maxPrice
                          ? formatMoney(p.minPrice)
                          : `${formatMoney(p.minPrice)} – ${formatMoney(p.maxPrice)}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/shop`}
                            target="_blank"
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            title="View on Storefront"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
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
        </div>
      )}
    </div>
  );
}
