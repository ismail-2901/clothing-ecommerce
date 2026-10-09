"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, SlidersHorizontal } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Price breakpoints in paisa (BDT * 100). Display labels use ৳ + taka.
const PRICE_STEPS = [
  { label: "Any", value: "" },
  { label: "Under ৳500", value: "0-500" },
  { label: "৳500 – ৳1,000", value: "500-1000" },
  { label: "৳1,000 – ৳2,000", value: "1000-2000" },
  { label: "৳2,000 – ৳3,500", value: "2000-3500" },
  { label: "Over ৳3,500", value: "3500-" },
];

type ActiveFilters = {
  category: string;
  size: string;
  color: string;
  priceRange: string;
  q: string;
  sort: string;
};

function buildUrl(base: string, overrides: Partial<Record<string, string>>, current: URLSearchParams): string {
  const sp = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(overrides)) {
    if (v === "" || v === undefined) {
      sp.delete(k);
    } else {
      sp.set(k, v);
    }
  }
  // Reset page on any filter change
  sp.delete("page");
  const qs = sp.toString();
  return `${base}${qs ? `?${qs}` : ""}`;
}

export type CategoryFilterItem = {
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Array<{ id?: string; name: string; slug: string }>;
};

export function ShopFilters({
  active,
  categories: categoryProp,
}: {
  active: ActiveFilters;
  categories?: CategoryFilterItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nav = useCallback(
    (overrides: Partial<Record<string, string>>) => {
      router.push(buildUrl(pathname, overrides, searchParams));
    },
    [router, pathname, searchParams]
  );

  const activeFilterCount = [
    active.size,
    active.priceRange,
    active.color,
    active.q
  ].filter(Boolean).length;

  const normalizedCategories: CategoryFilterItem[] = (() => {
    if (!categoryProp || categoryProp.length === 0) {
      return [
        {
          name: "Women",
          slug: "women",
          children: [
            { name: "Dresses", slug: "dresses" },
            { name: "Tops", slug: "women-tops" },
            { name: "Bottoms", slug: "women-bottoms" },
            { name: "Outerwear", slug: "women-outerwear" }
          ]
        },
        {
          name: "Men",
          slug: "men",
          children: [
            { name: "Tops", slug: "tops" },
            { name: "Bottoms", slug: "bottoms" },
            { name: "Outerwear", slug: "outerwear" },
            { name: "Activewear", slug: "activewear" },
            { name: "Essentials", slug: "essentials" }
          ]
        },
        {
          name: "Accessories",
          slug: "accessories",
          children: [
            { name: "Luxury", slug: "accessories-luxury-1790697878314" }
          ]
        }
      ];
    }

    const topLevel: CategoryFilterItem[] = [];
    const childMap = new Map<string, CategoryFilterItem[]>();

    for (const c of categoryProp) {
      if (c.parentId) {
        const list = childMap.get(c.parentId) || [];
        list.push(c);
        childMap.set(c.parentId, list);
      }
    }

    for (const c of categoryProp) {
      if (!c.parentId) {
        const existingChildren = c.children || [];
        const mappedChildren = c.id ? (childMap.get(c.id) || []) : [];
        const mergedChildren = [...existingChildren];
        for (const mc of mappedChildren) {
          if (!mergedChildren.some((ec) => ec.slug === mc.slug)) {
            mergedChildren.push(mc);
          }
        }
        topLevel.push({ ...c, children: mergedChildren });
      }
    }

    return topLevel;
  })();

  return (
    <aside className="space-y-7">
      {/* Active filter chips + Clear */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Filters
            </p>
            <button
              type="button"
              onClick={() => nav({ size: "", priceRange: "", color: "", q: "" })}
              className="text-[10px] font-semibold text-danger hover:text-danger/70 transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {active.size && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                Size: {active.size}
                <button type="button" onClick={() => nav({ size: "" })} aria-label="Remove size filter">
                  <X size={11} className="text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            )}
            {active.priceRange && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                {PRICE_STEPS.find((s) => s.value === active.priceRange)?.label ?? active.priceRange}
                <button type="button" onClick={() => nav({ priceRange: "" })} aria-label="Remove price filter">
                  <X size={11} className="text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            )}
            {active.q && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                &quot;{active.q}&quot;
                <button type="button" onClick={() => nav({ q: "" })} aria-label="Remove search filter">
                  <X size={11} className="text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Categories</h2>
        <div className="space-y-1 text-xs">
          {/* All Option */}
          <button
            type="button"
            onClick={() => nav({ category: "" })}
            className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
              !active.category
                ? "bg-foreground text-background font-bold"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
            }`}
          >
            <span>All</span>
          </button>

          {/* Hierarchical Top-Level & Subcategories */}
          {normalizedCategories.map((cat) => {
            const isParentActive = active.category === cat.slug;
            const hasChildren = cat.children && cat.children.length > 0;
            const hasActiveChild = hasChildren && cat.children!.some((ch) => active.category === ch.slug);

            return (
              <div key={cat.slug} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => nav({ category: cat.slug })}
                  className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                    isParentActive
                      ? "bg-foreground text-background font-bold"
                      : hasActiveChild
                      ? "text-foreground font-semibold bg-muted/40"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>

                {hasChildren && (
                  <div className="ml-3 pl-2.5 border-l border-border/60 space-y-0.5 my-1">
                    {cat.children!.map((sub) => {
                      const isSubActive = active.category === sub.slug;
                      return (
                        <button
                          key={sub.slug}
                          type="button"
                          onClick={() => nav({ category: sub.slug })}
                          className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[11px] transition-colors ${
                            isSubActive
                              ? "bg-foreground text-background font-bold"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 border-t border-border/80 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Price Range</h2>
        <div className="space-y-0.5 text-xs">
          {PRICE_STEPS.map((step) => {
            const isActive = active.priceRange === step.value;
            return (
              <button
                key={step.value}
                type="button"
                onClick={() => nav({ priceRange: step.value })}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-foreground text-background font-bold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-2 border-t border-border/80 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Size</h2>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const isActive = active.size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => nav({ size: isActive ? "" : s })}
                aria-pressed={isActive}
                className={`min-w-[40px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Promo Card */}
      <div className="border-t border-border/80 pt-5">
        <div className="relative overflow-hidden rounded-xl border border-border bg-stone-100 p-5 space-y-3">
          <div className="relative h-44 w-full overflow-hidden rounded-lg bg-stone-200">
            <Image
              src="/elaris-women.jpg"
              alt="Style Stays With You"
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ELARIS</p>
            <h3 className="text-sm font-bold text-foreground">Style Stays With You</h3>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4 text-foreground pt-1"
            >
              Shop Now <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
