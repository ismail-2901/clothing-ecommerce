export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/features/catalog/data";

export default function AdminProductsPage() {
  const products = getAllProducts();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
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

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["All", "Published", "Draft", "Archived", "Low stock"].map((f) => (
          <button key={f} type="button" className="rounded-sm border border-border px-3 py-1.5 hover:bg-muted">
            {f}
          </button>
        ))}
      </div>

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
              const prices = product.variants.map((v) => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              const lowStock = totalStock <= 5;

              return (
                <tr key={product.id} className="bg-background hover:bg-muted/30 transition">
                  <td className="px-4 py-4">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                  </td>
                  <td className="px-4 py-4 capitalize text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-4">{product.variants.length}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {minPrice === maxPrice
                      ? formatMoney(minPrice)
                      : `${formatMoney(minPrice)} – ${formatMoney(maxPrice)}`}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={lowStock ? "danger" : "success"}>{totalStock} units</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="success">Published</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        Edit
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
  );
}
