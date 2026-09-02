import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getFilteredProducts } from "@/features/catalog/data";

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const products = getFilteredProducts({
    category: readParam(params.category),
    color: readParam(params.color),
    size: readParam(params.size),
    q: readParam(params.q)
  });

  return (
    <div className="container-shell py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Shop
          </p>
          <h1 className="mt-2 text-4xl font-semibold">All clothing</h1>
        </div>
        <Button variant="outline">
          <SlidersHorizontal aria-hidden="true" size={18} />
          Filters
        </Button>
      </div>

      <div className="grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <FilterBlock title="Category" values={["men", "women", "essentials"]} />
            <FilterBlock title="Color" values={["black", "white", "charcoal"]} />
            <FilterBlock title="Size" values={["xs", "s", "m", "l", "xl"]} />
          </div>
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{products.length} products</p>
            <p>Sorted by relevance</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 grid gap-2">
        {values.map((value) => (
          <a
            key={value}
            className="text-sm capitalize text-muted-foreground hover:text-foreground"
            href={`/shop?${title.toLowerCase()}=${value}`}
          >
            {value}
          </a>
        ))}
      </div>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

