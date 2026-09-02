import { Search } from "lucide-react";
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = readParam(params.q)?.trim() ?? "";

  const products = q
    ? getFilteredProducts({ q })
    : [];

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
          {products.length === 0
            ? "No products found."
            : `${products.length} ${products.length === 1 ? "product" : "products"} found`}
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
