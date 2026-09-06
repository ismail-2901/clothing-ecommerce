import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, LayoutGrid, List, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { getFilteredProducts } from "@/features/catalog/data";

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const categories = [
  { name: "All Women", count: 58, slug: "women" },
  { name: "Tops", count: 18, slug: "tops" },
  { name: "Dresses", count: 12, slug: "dresses" },
  { name: "Outerwear", count: 8, slug: "outerwear" },
  { name: "Bottoms", count: 10, slug: "bottoms" },
  { name: "Activewear", count: 6, slug: "activewear" },
  { name: "Accessories", count: 4, slug: "accessories" },
];

const colors = [
  { name: "Black", hex: "#111111" },
  { name: "Beige", hex: "#E6DBCB" },
  { name: "Pink", hex: "#F3C5C5" },
  { name: "Blue", hex: "#9BB7D4" },
  { name: "Green", hex: "#A3C1AD" },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = readParam(params.category) || "women";
  const products = await getFilteredProducts({
    category: readParam(params.category),
    color: readParam(params.color),
    size: readParam(params.size),
    q: readParam(params.q)
  });

  return (
    <div className="container-shell py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground capitalize">{activeCategory}</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground capitalize">
            {activeCategory === "women" ? "Women" : activeCategory}
          </h1>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Discover effortless style for every moment.
        </p>
      </div>

      {/* Editorial Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-stone-100 p-6 sm:p-8 flex items-center justify-between min-h-[160px]">
        <div className="space-y-2 max-w-md z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            CONFIDENCE LOOKS GOOD ON YOU
          </p>
          <p className="font-serif italic text-3xl sm:text-4xl text-foreground">
            More Than Clothing
          </p>
        </div>
        <div className="relative h-36 w-64 sm:w-80 shrink-0 overflow-hidden rounded-xl hidden sm:block">
          <Image
            src="/elaris-women.jpg"
            alt="Elaris Women Collection"
            fill
            className="object-cover object-top"
            sizes="320px"
          />
        </div>
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="grid gap-10 lg:grid-cols-[240px_1fr] items-start pt-2">
        {/* Left Sidebar Filters */}
        <aside className="space-y-8">
          {/* Categories */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Categories</h2>
            <div className="space-y-1 text-xs">
              {categories.map((cat) => {
                const isSelected = activeCategory.toLowerCase() === cat.slug.toLowerCase() || (activeCategory === "women" && cat.slug === "women");
                return (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                      isSelected
                        ? "bg-muted font-bold text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-muted-foreground">({cat.count})</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 border-t border-border/80 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Price Range</h2>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              defaultValue="5000"
              className="w-full accent-foreground cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>৳0</span>
              <span>৳5,000+</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 border-t border-border/80 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Size</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input type="checkbox" className="h-4 w-4 rounded border-border accent-foreground cursor-pointer" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3 border-t border-border/80 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Color</h2>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  className="h-6 w-6 rounded-full border border-black/20 shadow-inner hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
                +
              </span>
            </div>
          </div>

          {/* Sidebar Promo Card */}
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
        </aside>

        {/* Product Grid Area */}
        <section className="space-y-6">
          {/* Controls bar */}
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {products.length || 58} Products
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground hidden sm:inline">Sort by:</span>
                <select className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium focus:border-foreground focus:outline-none cursor-pointer">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                <button type="button" className="p-1 text-foreground hover:bg-muted rounded" aria-label="Grid view">
                  <LayoutGrid size={16} />
                </button>
                <button type="button" className="p-1 hover:text-foreground hover:bg-muted rounded" aria-label="List view">
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <p className="text-base font-semibold text-foreground">No products found</p>
              <p className="mt-1 text-xs">Try clearing filters or checking other categories.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                ←
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-bold">
                1
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                2
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                3
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                4
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                5
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                →
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing 1 – {Math.min(products.length, 8)} of {products.length || 58} products
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

