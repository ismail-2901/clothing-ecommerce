import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections – Elaris",
  description: "Explore curated seasonal editions, streetwear lookbooks, and elevated wardrobe collections at Elaris."
};

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  href: string;
}

const collections: CollectionItem[] = [
  {
    id: "minimalist-streetwear",
    title: "Minimalist Streetwear",
    subtitle: "Heavyweight cotton hoodies, relaxed-fit trousers, and structured monochrome staples.",
    badge: "New Drop",
    image: "/elaris-men.jpg",
    href: "/shop?category=men"
  },
  {
    id: "contemporary-feminine",
    title: "Contemporary Feminine",
    subtitle: "Soft knitwear, effortless denim cuts, and tailored essentials for everyday elegance.",
    badge: "Trending",
    image: "/elaris-women.jpg",
    href: "/shop?category=women"
  },
  {
    id: "monochrome-studio",
    title: "Monochrome Studio",
    subtitle: "High-contrast blacks, architectural whites, and pure neutral tones designed to mix and match.",
    badge: "Core Capsule",
    image: "/elaris-hero.jpg",
    href: "/shop?color=black"
  },
  {
    id: "signature-accessories",
    title: "Signature Accessories",
    subtitle: "Premium embroidered caps, minimal acetate sunglasses, and refined everyday accents.",
    badge: "Essentials",
    image: "/elaris-accessories.jpg",
    href: "/shop?category=accessories"
  },
  {
    id: "seasonal-highlights",
    title: "Seasonal Deals & Edits",
    subtitle: "Limited-run pricing on our most sought-after silhouettes and warm-weather favorites.",
    badge: "Up to 30% Off",
    image: "/elaris-deals.jpg",
    href: "/offers"
  },
  {
    id: "urban-tailoring",
    title: "Urban Tailoring",
    subtitle: "Relaxed blazers, clean collar overshirts, and versatile bottoms built for day-to-night transitions.",
    badge: "Seasonal",
    image: "/elaris-women.jpg",
    href: "/shop"
  }
];

export default function CollectionsPage() {
  return (
    <div className="container-shell py-8 sm:py-12 space-y-12">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Collections</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Curated Drops
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Collections
            </h1>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Thoughtfully engineered wardrobes and seasonal capsules. Every collection is edited down to pure essentials.
          </p>
        </div>
      </div>

      {/* Featured Headline Collection Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-stone-900 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[440px]">
          {/* Left Text / Info */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/15">
                <Sparkles size={12} className="text-amber-300" />
                <span>Headline Release &bull; Season &#39;25</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Wear Your Story
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed">
                A definitive edit of oversized sportswear, understated streetwear silhouettes, and precision-cut essentials crafted for effortless modern expression.
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-zinc-100 transition-colors shadow-sm"
              >
                Shop The Collection <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative lg:col-span-6 min-h-[260px] lg:min-h-full">
            <Image
              src="/elaris-hero.jpg"
              alt="Wear Your Story Collection Lookbook"
              fill
              className="object-cover object-top"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-stone-900 lg:to-transparent" />
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <section className="space-y-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Explore All Editions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={col.href}
              className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background hover:border-foreground/40 hover:shadow-md transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/11] overflow-hidden bg-muted">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <span className="rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
                    {col.badge}
                  </span>
                </div>
              </div>

              {/* Content Footer */}
              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {col.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-bold uppercase tracking-wider text-foreground">
                  <span>Explore</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Catalog Callout Footer */}
      <section className="rounded-xl border border-border bg-muted/30 p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Looking for Something Specific?
        </h2>
        <p className="max-w-lg mx-auto text-xs sm:text-sm text-muted-foreground">
          Browse our complete catalog with advanced filters for category, color, size, and real-time stock availability.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors shadow-sm"
          >
            Browse Full Catalog <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
