import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquareText, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getCatalogHighlights } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";

export default function HomePage() {
  const { hero, categories, offers, curatedProducts } = getCatalogHighlights();

  return (
    <div>
      <section className="container-shell grid min-h-[78vh] gap-10 py-8 md:grid-cols-[1fr_0.92fr] md:items-center md:py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {hero.kicker}
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-none md:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            {hero.copy}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/shop">
                Shop the collection <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/offers">View offers</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            className="object-cover"
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </section>

      <section className="border-y border-border bg-muted/60 py-10">
        <div className="container-shell grid gap-4 md:grid-cols-3">
          {[
            ["COD and gateways", "Cash on Delivery baseline with payment providers isolated for production."],
            ["Inventory safe", "Variant stock and pricing are validated by server-side domain logic."],
            ["Grounded AI", "Assistant recommendations only reference catalog products."]
          ].map(([title, copy], index) => {
            const Icon = index === 0 ? Truck : index === 1 ? ShieldCheck : MessageSquareText;
            return (
              <div
                key={title}
                className="flex gap-4 rounded-md border border-border bg-background p-5"
              >
                <Icon aria-hidden="true" size={22} />
                <div>
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-shell py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current collection
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Built for daily polish
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/shop">
              Browse all <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-shell grid gap-5 py-10 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-[5/4] overflow-hidden rounded-lg border border-border bg-muted"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-white/90 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Category
              </p>
              <h3 className="mt-1 text-xl font-semibold">{category.name}</h3>
            </div>
          </Link>
        ))}
      </section>

      <section className="container-shell grid gap-6 py-14 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Active offers
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Clear savings, no guesswork</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Offer math is designed to run through the server pricing engine, so
            storefront totals and checkout totals stay aligned.
          </p>
        </div>
        <div className="grid gap-3">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="flex items-center justify-between gap-4 rounded-md border border-border p-5"
            >
              <div>
                <p className="text-sm font-semibold">{offer.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{offer.summary}</p>
              </div>
              <span className="shrink-0 rounded-sm border border-border px-3 py-2 text-sm font-semibold">
                {offer.code}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-foreground py-14 text-background">
        <div className="container-shell grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              AI shopping assistant
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Search like you speak.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300">
              Ask for outfits by color, budget, fit, occasion, or material. The
              assistant converts intent into structured filters before ranking
              real catalog products.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-300">
              Try: "Find a black outfit under {formatMoney(300000)} for dinner."
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Brand story
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Premium essentials, edited down.</h2>
        </div>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Email for collection updates"
            className="h-12 rounded-md border border-border px-4 text-sm"
          />
          <Button type="submit">Join newsletter</Button>
        </form>
      </section>
    </div>
  );
}

