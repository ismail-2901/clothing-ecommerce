"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { CatalogProduct } from "@/features/catalog/data";

export function ShopCatalogView({
  products,
  totalCount,
  sortValue
}: {
  products: CatalogProduct[];
  totalCount: number;
  sortValue: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <p className="text-xs sm:text-sm font-semibold text-foreground">
          Showing <span className="font-bold">{totalCount}</span> {totalCount === 1 ? "Product" : "Products"}
        </p>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              defaultValue={sortValue}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-stone-900 focus:outline-none cursor-pointer shadow-xs"
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", e.target.value);
                url.searchParams.delete("page");
                router.push(url.pathname + (url.search ? url.search : ""));
              }}
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground border-l border-border/60 pl-3">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition ${
                view === "grid"
                  ? "text-foreground bg-muted shadow-xs"
                  : "hover:text-foreground hover:bg-muted"
              }`}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition ${
                view === "list"
                  ? "text-foreground bg-muted shadow-xs"
                  : "hover:text-foreground hover:bg-muted"
              }`}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display (Grid or List mode) with 2-Column Mobile Grid */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold text-foreground">No apparel pieces found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing filters or checking other collections.</p>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid gap-6 grid-cols-1 sm:grid-cols-2"
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
