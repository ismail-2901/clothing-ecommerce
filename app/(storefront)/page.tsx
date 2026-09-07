import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

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
      <section className="elaris-hero">
        <div className="elaris-hero-grid">

          {/* Left column: text content + slide controls */}
          <div className="elaris-hero-left">
            <div className="elaris-hero-text">
              <p className="elaris-kicker">New Season &#39;25</p>
              <h1 className="elaris-headline">
                <span>Wear Your</span>
                <span>Story</span>
              </h1>
              <p className="elaris-subline">Minimal. Modern. Made for you.</p>
              <Link href="/shop" className="elaris-cta-link">
                Shop New In <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {/* Slide controls pinned to bottom of left column */}
            <div className="elaris-slide-bar">
              <div className="elaris-slide-nums">
                <button type="button" className="elaris-slide-num active" aria-label="Slide 1">01</button>
                <button type="button" className="elaris-slide-num" aria-label="Slide 2">02</button>
                <button type="button" className="elaris-slide-num" aria-label="Slide 3">03</button>
              </div>
              <div className="elaris-slide-navs">
                <button type="button" className="elaris-nav-btn" aria-label="Previous slide">&#8592;</button>
                <button type="button" className="elaris-nav-btn" aria-label="Next slide">&#8594;</button>
              </div>
            </div>
          </div>

          {/* Center column: hero image fills full height */}
          <div className="elaris-hero-img-col">
            <Image
              src="/elaris-hero.jpg"
              alt="Man in Elaris black sweatshirt and cap"
              fill
              className="object-cover object-top"
              priority
              sizes="(min-width: 768px) 48vw, 100vw"
            />
          </div>

          {/* Right column: discount badge */}
          <div className="elaris-hero-badge-col">
            <div className="elaris-badge-box">
              <Gift size={26} aria-hidden="true" className="elaris-badge-gift" />
              <span className="elaris-badge-upto">UP TO</span>
              <span className="elaris-badge-pct">30%</span>
              <span className="elaris-badge-off">OFF</span>
              <span className="elaris-badge-note">ON SELECTED ITEMS</span>
            </div>
          </div>

        </div>
      </section>

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
