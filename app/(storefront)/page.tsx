import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroSlider } from "@/components/home/hero-slider";
import { getAllProducts } from "@/features/catalog/data";
import { ProductCard } from "@/components/product/product-card";

export default async function HomePage() {
  const products = await getAllProducts();
  const featuredProducts = products.slice(0, 8);

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
      <HeroSlider />

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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
