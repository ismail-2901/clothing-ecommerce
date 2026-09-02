export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from "@/features/catalog/data";
import { AlertTriangle } from "lucide-react";

export default function AdminInventoryPage() {
  const products = getAllProducts();

  const variants = products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p.name,
      slug: p.slug,
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock: v.stock,
      reserved: 0, // replace with DB value
    }))
  );

  const lowStockThreshold = 5;
  const outOfStock = variants.filter((v) => v.stock === 0).length;
  const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= lowStockThreshold).length;

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Inventory</h1>
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
          {outOfStock} SKUs are out of stock and {lowStock} are running low. Review and restock.
        </div>
      )}

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
                    <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
                      Adjust
                    </button>
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
