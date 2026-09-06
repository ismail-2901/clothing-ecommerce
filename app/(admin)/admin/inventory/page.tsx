export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Boxes,
  Plus,
  Download,
  Filter,
  PackageCheck,
  Search,
  ExternalLink,
  Edit,
  ArrowUpDown
} from "lucide-react";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminSearchInput } from "@/components/admin/admin-search-input";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const { q, status } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { sku: { contains: term, mode: "insensitive" } },
      { color: { contains: term, mode: "insensitive" } },
      { size: { contains: term, mode: "insensitive" } },
      { product: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const lowStockThreshold = 5;

  if (status === "low") {
    whereClause.stockQuantity = { gt: 0, lte: lowStockThreshold };
  } else if (status === "out") {
    whereClause.stockQuantity = { lte: 0 };
  } else if (status === "in") {
    whereClause.stockQuantity = { gt: lowStockThreshold };
  }

  const dbVariants = await prisma.productVariant.findMany({
    where: whereClause,
    include: {
      product: { select: { id: true, name: true, slug: true, basePrice: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const variants = dbVariants.map((v) => ({
    id: v.id,
    productId: v.product.id,
    product: v.product.name,
    slug: v.product.slug,
    sku: v.sku,
    color: v.color,
    size: v.size,
    stock: v.stockQuantity,
    reserved: v.reservedQuantity,
    price: v.priceOverride ?? v.product.basePrice,
  }));

  const totalSKUs = variants.length;
  const outOfStockList = variants.filter((v) => v.stock === 0);
  const lowStockList = variants.filter((v) => v.stock > 0 && v.stock <= lowStockThreshold);
  const inStockList = variants.filter((v) => v.stock > lowStockThreshold);

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Inventory Management
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalSKUs} SKUs
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Monitor real-time warehouse stock levels, variant SKUs, and replenishment queues
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
          <p className="text-xs font-medium text-muted-foreground">Total SKUs Tracked</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalSKUs}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active variant inventory</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Healthy In-Stock</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{inStockList.length}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {totalSKUs > 0 ? Math.round((inStockList.length / totalSKUs) * 100) : 100}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Sufficient stock levels</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Low Stock (≤{lowStockThreshold})</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{lowStockList.length}</span>
            {lowStockList.length > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Alert
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Needs restock order</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{outOfStockList.length}</span>
            {outOfStockList.length > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Urgent
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Customer orders blocked</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="w-full sm:max-w-md">
          <AdminSearchInput placeholder="Search SKU, product name, color, size…" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/admin/inventory"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !status
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalSKUs})
          </Link>
          <Link
            href="/admin/inventory?status=in"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              status === "in"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            In Stock ({inStockList.length})
          </Link>
          <Link
            href="/admin/inventory?status=low"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              status === "low"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Low Stock ({lowStockList.length})
          </Link>
          <Link
            href="/admin/inventory?status=out"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              status === "out"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Out of Stock ({outOfStockList.length})
          </Link>
        </div>
      </div>

      {/* Main Inventory Table */}
      {variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <Boxes size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No inventory records found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try adjusting your search criteria or add new variants to your products.
          </p>
          <Button asChild className="mt-4 text-xs">
            <Link href="/admin/products/new">Add First Product</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Variant</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-center">Reserved</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {variants.map((v) => {
                  const available = Math.max(0, v.stock - v.reserved);
                  const isOutOfStock = v.stock === 0;
                  const isLowStock = v.stock > 0 && v.stock <= lowStockThreshold;

                  return (
                    <tr key={v.sku} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <Link href={`/admin/products/${v.productId}/edit`} className="hover:underline">
                          {v.product}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground/80">
                        {v.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="capitalize font-medium text-foreground">{v.color}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-bold text-[10px] text-foreground">
                            {v.size}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-foreground">
                        {v.stock}
                      </td>
                      <td className="py-3.5 px-4 text-center text-muted-foreground">
                        {v.reserved}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-foreground">
                        {available}
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/products/${v.productId}/edit`}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              {lowStockList.slice(0, 4).map((item) => (
                <div key={item.sku} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.product}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{item.sku} • {item.color} / {item.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-600">{item.stock} left</span>
                    <Link
                      href={`/admin/products/${item.productId}/edit`}
                      className="rounded bg-foreground px-2 py-1 text-[11px] font-bold text-background hover:bg-foreground/90 transition"
                    >
                      Restock
                    </Link>
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
              {outOfStockList.slice(0, 4).map((item) => (
                <div key={item.sku} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.product}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{item.sku} • {item.color} / {item.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-600">0 in stock</span>
                    <Link
                      href={`/admin/products/${item.productId}/edit`}
                      className="rounded bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition"
                    >
                      Refill
                    </Link>
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
