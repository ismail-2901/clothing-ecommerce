"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

type Slide = {
  id: string;
  num: string;
  kicker: string;
  headline: [string, string];
  subline: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  alt: string;
  badgeDiscount: string;
  badgeNote: string;
};

const slides: Slide[] = [
  {
    id: "slide-1",
    num: "01",
    kicker: "New Season '25",
    headline: ["Wear Your", "Story"],
    subline: "Minimal. Modern. Made for you.",
    ctaText: "Shop New In",
    ctaHref: "/shop",
    image: "/elaris-hero.jpg",
    alt: "Man in Elaris black sweatshirt and cap",
    badgeDiscount: "30%",
    badgeNote: "ON SELECTED ITEMS"
  },
  {
    id: "slide-2",
    num: "02",
    kicker: "Spring Essentials",
    headline: ["Form &", "Function"],
    subline: "Clean lines engineered for effortless movement.",
    ctaText: "Shop Collection",
    ctaHref: "/shop?category=women",
    image: "/elaris-women.jpg",
    alt: "Woman in Elaris modern knitwear",
    badgeDiscount: "25%",
    badgeNote: "SPRING DROP"
  },
  {
    id: "slide-3",
    num: "03",
    kicker: "Urban Signature",
    headline: ["Timeless", "Comfort"],
    subline: "Understated essentials designed to outlast the season.",
    ctaText: "Explore Men",
    ctaHref: "/shop?category=men",
    image: "/elaris-men.jpg",
    alt: "Man in Elaris urban streetwear",
    badgeDiscount: "20%",
    badgeNote: "LIMITED DROP"
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const active = slides[current];

  return (
    <section className="elaris-hero" aria-label="Hero slider">
      <div className="elaris-hero-grid">
        {/* Left column: text content + slide controls */}
        <div className="elaris-hero-left">
          <div className="elaris-hero-text transition-opacity duration-300">
            <p className="elaris-kicker">{active.kicker}</p>
            <h1 className="elaris-headline">
              <span>{active.headline[0]}</span>
              <span>{active.headline[1]}</span>
            </h1>
            <p className="elaris-subline">{active.subline}</p>
            <Link href={active.ctaHref} className="elaris-cta-link">
              {active.ctaText} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Slide controls pinned to bottom of left column */}
          <div className="elaris-slide-bar">
            <div className="elaris-slide-nums">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={`elaris-slide-num ${idx === current ? "active" : ""}`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === current ? "true" : undefined}
                >
                  {s.num}
                </button>
              ))}
            </div>
            <div className="elaris-slide-navs">
              <button
                type="button"
                onClick={prevSlide}
                className="elaris-nav-btn"
                aria-label="Previous slide"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="elaris-nav-btn"
                aria-label="Next slide"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>

        {/* Center column: hero image fills full height */}
        <div className="elaris-hero-img-col">
          <Image
            key={active.image}
            src={active.image}
            alt={active.alt}
            fill
            className="object-cover object-top transition-opacity duration-500"
            priority
            sizes="(min-width: 768px) 48vw, 100vw"
          />
        </div>

        {/* Right column: discount badge */}
        <div className="elaris-hero-badge-col">
          <div className="elaris-badge-box">
            <Gift size={26} aria-hidden="true" className="elaris-badge-gift" />
            <span className="elaris-badge-upto">UP TO</span>
            <span className="elaris-badge-pct">{active.badgeDiscount}</span>
            <span className="elaris-badge-off">OFF</span>
            <span className="elaris-badge-note">{active.badgeNote}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
