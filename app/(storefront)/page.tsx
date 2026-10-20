import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, RotateCcw, ShieldCheck, Feather } from "lucide-react";
import { HeroSlider } from "@/components/home/hero-slider";
import { getFilteredProducts } from "@/features/catalog/data";
import { getCachedHeroSlides } from "@/lib/cache/db-cache";
import { ProductCard } from "@/components/product/product-card";


export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export const revalidate = 60; // F2: ISR \u2014 regenerate every 60 seconds


export default async function HomePage() {
  // F3: Fetch hero slides from DB (falls back to hardcoded defaults if empty)
  const [{ products: featuredProducts }, heroSlides] = await Promise.all([
    getFilteredProducts({}, { page: 1, perPage: 8 }),
    getCachedHeroSlides()
  ]);


  const categoryGrid = [
    {
      label: "Women",
      href: "/shop?category=women",
      image: "/elaris-women.jpg",
      alt: "Women's fashion",
      position: "object-[center_12%]"
    },
    {
      label: "Men",
      href: "/shop?category=men",
      image: "/elaris-men.jpg",
      alt: "Men's streetwear",
      position: "object-[center_14%]"
    },
    {
      label: "Accessories",
      href: "/shop?category=accessories",
      image: "/elaris-accessories.jpg",
      alt: "Accessories",
      position: "object-center"
    },
    {
      label: "Best Deals",
      href: "/offers",
      image: "/elaris-deals.jpg",
      alt: "Best deals",
      position: "object-center"
    }
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <HeroSlider slides={heroSlides.length > 0 ? heroSlides : undefined} />


      {/* ── Shop By Category ── */}
      <section className="elaris-cat-section">
        <div className="container-shell">
          <p className="elaris-cat-title">Shop by Category</p>
          <div className="elaris-cat-grid">
            {categoryGrid.map((cat) => (
              <Link key={cat.label} href={cat.href} className="elaris-cat-card group">
                <div className="elaris-cat-img-wrap">
                  <Image
                    src={cat.image}
                    alt={cat.alt}
                    fill
                    className={`object-cover ${cat.position || "object-center"} transition-transform duration-500 group-hover:scale-105`}
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                </div>
                <div className="elaris-cat-footer">
                  <span>{cat.label}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products Grid ── */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-background">
          <div className="container-shell space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Curated Collection</span>
                </div>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Featured Arrivals
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline underline-offset-4"
              >
                View All Products <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Editorial Campaign Spotlight (Alo Yoga Style Dual Feature) ── */}
      <section className="py-12 border-t border-border/80 bg-stone-50">
        <div className="container-shell space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Curated Editorial
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Form, Function &amp; Fluidity
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Designed with architectural precision and breathable luxury textiles. Built for effortless transition from workday to evening.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Spotlight 1: Women */}
            <div className="group relative overflow-hidden rounded-2xl bg-muted aspect-[4/5] sm:aspect-[16/11]">
              <Image
                src="/elaris-women.jpg"
                alt="Women's Editorial Collection"
                fill
                className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  New Capsule
                </p>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  The Feminine Silhouette
                </h3>
                <p className="text-xs text-white/80 max-w-sm line-clamp-2">
                  Minimal drape, clean tailoring, and tactile knitwear engineered for modern presence.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop?category=women"
                    className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-white/90 transition-colors"
                  >
                    Shop Women <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Spotlight 2: Men */}
            <div className="group relative overflow-hidden rounded-2xl bg-muted aspect-[4/5] sm:aspect-[16/11]">
              <Image
                src="/elaris-men.jpg"
                alt="Men's Editorial Streetwear"
                fill
                className="object-cover object-[center_18%] transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Signature Drop
                </p>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Urban Architecture
                </h3>
                <p className="text-xs text-white/80 max-w-sm line-clamp-2">
                  Heavyweight fleece, boxy proportions, and structured essentials designed to endure.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop?category=men"
                    className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-white/90 transition-colors"
                  >
                    Shop Men <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Trust & Value Proposition Strip ── */}
      <section className="py-12 border-t border-border/80 bg-background">
        <div className="container-shell">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                <Truck size={20} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Nationwide Delivery</h4>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Fast delivery across Bangladesh, free on orders over ৳5,000.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                <RotateCcw size={20} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">7-Day Free Exchange</h4>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Effortless size swaps and easy returns within 7 business days.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Cash On Delivery</h4>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Pay securely at your doorstep or via trusted digital wallets.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                <Feather size={20} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Artisanal Craft</h4>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Organic cotton blends and durable high-density construction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
