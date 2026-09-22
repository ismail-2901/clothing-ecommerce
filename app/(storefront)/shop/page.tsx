import Link from "next/link";
import Image from "next/image";
import { ShopCatalogView } from "@/components/shop/shop-catalog-view";
import { ShopFilters } from "@/components/shop/shop-filters";
import { getFilteredProducts } from "@/features/catalog/data";
import { prisma } from "@/db/prisma";

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Price range param → {minPrice, maxPrice} in paisa (BDT * 100)
function parsePriceRange(raw: string | undefined): { minPrice?: number; maxPrice?: number } {
  if (!raw) return {};
  const [minStr, maxStr] = raw.split("-");
  const min = minStr ? parseInt(minStr, 10) * 100 : undefined;
  const max = maxStr ? parseInt(maxStr, 10) * 100 : undefined;
  return {
    minPrice: isNaN(min as number) ? undefined : min,
    maxPrice: !maxStr || isNaN(max as number) ? undefined : max
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = readParam(params.category) || "";
  const sort = readParam(params.sort) || "";
  const page = Math.max(1, parseInt(readParam(params.page) || "1", 10) || 1);
  const activeSize = readParam(params.size) || "";
  const activeColor = readParam(params.color) || "";
  const activeQ = readParam(params.q) || "";
  const activePriceRange = readParam(params.priceRange) || "";
  const pageSize = 8;

  const { minPrice, maxPrice } = parsePriceRange(activePriceRange);

  const [allProducts, categories] = await Promise.all([
    getFilteredProducts({
      category: activeCategory || undefined,
      color: activeColor || undefined,
      size: activeSize || undefined,
      q: activeQ || undefined,
      minPrice,
      maxPrice
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true },
      orderBy: [{ position: "asc" }, { name: "asc" }]
    })
  ]);

  if (sort === "price_asc") {
    allProducts.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
  } else if (sort === "price_desc") {
    allProducts.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
  }
  // newest: already sorted by createdAt desc from DB

  const totalCount = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);

  const createPageUrl = (targetPage: number) => {
    const sp = new URLSearchParams();
    if (activeCategory) sp.set("category", activeCategory);
    if (activeColor) sp.set("color", activeColor);
    if (activeSize) sp.set("size", activeSize);
    if (activeQ) sp.set("q", activeQ);
    if (activePriceRange) sp.set("priceRange", activePriceRange);
    if (sort) sp.set("sort", sort);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  const displayCategory = activeCategory || "Shop";

  return (
    <div className="container-shell py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-foreground capitalize">{activeCategory}</span>
            </>
          )}
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground capitalize">
          {activeCategory ? activeCategory : "All Products"}
        </h1>
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

      {/* Main Content: Sidebar Filters + Product Area */}
      <div className="grid gap-10 lg:grid-cols-[240px_1fr] items-start pt-2">
        {/* Sidebar Filters */}
        <ShopFilters
          categories={categories}
          active={{
            category: activeCategory,
            size: activeSize,
            color: activeColor,
            priceRange: activePriceRange,
            q: activeQ,
            sort
          }}
        />

        {/* Product Grid Area */}
        <section className="space-y-6">
          <ShopCatalogView
            products={paginatedProducts}
            totalCount={totalCount}
            sortValue={sort}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                {currentPage > 1 ? (
                  <Link
                    href={createPageUrl(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted text-foreground transition-colors"
                    aria-label="Previous page"
                  >
                    ←
                  </Link>
                ) : (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 text-muted-foreground/40 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    ←
                  </span>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={createPageUrl(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                      p === currentPage
                        ? "bg-foreground text-background"
                        : "border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link
                    href={createPageUrl(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted text-foreground transition-colors"
                    aria-label="Next page"
                  >
                    →
                  </Link>
                ) : (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 text-muted-foreground/40 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    →
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {totalCount === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalCount)} of {totalCount} products
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
