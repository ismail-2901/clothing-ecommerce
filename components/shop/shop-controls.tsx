"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";

export function ShopControls({
  productCount,
  sortValue
}: {
  productCount: number;
  sortValue: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  return (
    <div className="flex items-center justify-between border-b border-border/80 pb-4">
      <p className="text-xs sm:text-sm font-bold text-foreground">
        {productCount} Products
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground hidden sm:inline">Sort by:</span>
          {/* Sort is a link-based navigation — preserve as select for UX, JS-free fallback */}
          <select
            defaultValue={sortValue}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium focus:border-foreground focus:outline-none cursor-pointer"
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", e.target.value);
              window.location.href = url.toString();
            }}
          >
            <option value="">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`p-1 rounded transition ${view === "grid" ? "text-foreground bg-muted" : "hover:text-foreground hover:bg-muted"}`}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`p-1 rounded transition ${view === "list" ? "text-foreground bg-muted" : "hover:text-foreground hover:bg-muted"}`}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
