export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { Plus, Search, PackageSearch, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/db/prisma";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { name: true } },
      variants: {
        where: { deletedAt: null },
        select: { id: true, sku: true, color: true, size: true, priceOverride: true, stockQuantity: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const products = dbProducts.map((p) => {
    const prices = p.variants.map((v) => v.priceOverride ?? p.basePrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;
    const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || "Uncategorized",
      variantsCount: p.variants.length,
      minPrice,
      maxPrice,
      totalStock,
      status: p.status
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Storefront product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus size={16} /> Add product
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-background px-4">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, SKUs…"
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <PackageSearch size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No products created yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Get started by adding your first clothing piece with custom sizes, colors, pricing, and stock.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">
              <Plus size={16} /> Add product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Product", "Category", "Variants", "Price range", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const lowStock = product.totalStock <= 5;
                const statusVariant =
                  product.status === "PUBLISHED"
                    ? "success"
                    : product.status === "DRAFT"
                      ? "muted"
                      : "danger";

                return (
                  <tr key={product.id} className="bg-background hover:bg-muted/30 transition">
                    <td className="px-4 py-4">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-4">{product.variantsCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {product.minPrice === product.maxPrice
                        ? formatMoney(product.minPrice)
                        : `${formatMoney(product.minPrice)} – ${formatMoney(product.maxPrice)}`}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={lowStock ? "danger" : "success"}>{product.totalStock} units</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {product.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit product"
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
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
