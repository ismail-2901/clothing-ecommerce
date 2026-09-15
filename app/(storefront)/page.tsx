import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/home/hero-slider";

export default function HomePage() {
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
    </div>
  );
}
