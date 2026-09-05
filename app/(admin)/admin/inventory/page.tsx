export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Boxes, Plus } from "lucide-react";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { AdminSearchInput } from "@/components/admin/admin-search-input";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const { q } = (await searchParams) || {};

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

  const dbVariants = await prisma.productVariant.findMany({
    where: whereClause,
    include: {
      product: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const variants = dbVariants.map((v) => ({
    productId: v.product.id,
    product: v.product.name,
    slug: v.product.slug,
    sku: v.sku,
    color: v.color,
    size: v.size,
    stock: v.stockQuantity,
    reserved: v.reservedQuantity,
  }));

  const lowStockThreshold = 5;
  const outOfStock = variants.filter((v) => v.stock === 0).length;
  const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= lowStockThreshold).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time stock quantities across all variants</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus size={16} /> Add product
          </Link>
        </Button>
      </div>

      <div className="max-w-md">
        <AdminSearchInput placeholder="Search SKU, color, size, product name…" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Total SKUs</p>
          <p className="mt-2 text-2xl font-semibold">{variants.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Out of stock</p>
          <p className="mt-2 text-2xl font-semibold text-danger">{outOfStock}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Low stock (≤{lowStockThreshold})</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{lowStock}</p>
        </div>
      </div>

      {(outOfStock > 0 || lowStock > 0) && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          {outOfStock > 0 ? `${outOfStock} SKUs are out of stock` : ""}
          {outOfStock > 0 && lowStock > 0 ? " and " : ""}
          {lowStock > 0 ? `${lowStock} are running low (≤${lowStockThreshold}).` : ""}
        </div>
      )}

      {variants.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <Boxes size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No inventory variants added</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Inventory is populated automatically when you create products with color, size, and SKU variations.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">Add first product</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Product", "SKU", "Color", "Size", "In stock", "Reserved", "Available", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v) => {
                const available = v.stock - v.reserved;
                return (
                  <tr key={v.sku} className="bg-background hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.product}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                    <td className="px-4 py-3 capitalize">{v.color}</td>
                    <td className="px-4 py-3">{v.size}</td>
                    <td className="px-4 py-3">{v.stock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.reserved}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={available === 0 ? "danger" : available <= lowStockThreshold ? "warning" : "success"}
                      >
                        {available}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${v.productId}/edit`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
