import { Search } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getFilteredProducts } from "@/features/catalog/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search – Elaris",
  description: "Search the Elaris collection."
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const PAGE_SIZE = 20;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = readParam(params.q)?.trim() ?? "";
  const page = Math.max(1, parseInt(readParam(params.page) ?? "1", 10) || 1);

  const { products, total } = q
    ? await getFilteredProducts({ q }, { page, perPage: PAGE_SIZE })
    : { products: [] as import("@/features/catalog/data").CatalogProduct[], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const buildUrl = (targetPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Search
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        {q ? `Results for "${q}"` : "Search the collection"}
      </h1>

      {/* Search form */}
      <form className="mt-6" method="GET" action="/search">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-4">
          <Search size={18} className="shrink-0 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search products, colours, collections…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus={!q}
          />
          <button
            type="submit"
            className="h-8 shrink-0 rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:bg-zinc-800 transition"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <p className="mt-4 text-sm text-muted-foreground">
          {total === 0
            ? "No products found."
            : `${total} ${total === 1 ? "product" : "products"} found`}
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {q && totalPages > 1 && (
        <div className="border-t border-border/80 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            {currentPage > 1 ? (
              <Link
                href={buildUrl(currentPage - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted text-foreground transition-colors"
                aria-label="Previous page"
              >
                ←
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 text-muted-foreground/40 cursor-not-allowed" aria-disabled="true">←</span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl(p)}
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
                href={buildUrl(currentPage + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted text-foreground transition-colors"
                aria-label="Next page"
              >
                →
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 text-muted-foreground/40 cursor-not-allowed" aria-disabled="true">→</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, total)} of {total} results
          </p>
        </div>
      )}

      {q && products.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Try a different search term, or{" "}
            <a href="/shop" className="font-semibold underline underline-offset-4">
              browse all products
            </a>
            .
          </p>
        </div>
      )}

      {!q && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Popular searches
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["black shirt", "dress", "trouser", "oversized tee", "summer"].map((term) => (
              <a
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted transition capitalize"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

