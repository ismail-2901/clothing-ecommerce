"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import type { HeroSlideData } from "@/lib/cache/db-cache";

type Slide = HeroSlideData;

// Hardcoded fallback slides — used when no DB data exists (fresh install)
const DEFAULT_SLIDES: Slide[] = [
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
    badgeNote: "ON SELECTED ITEMS",
    isActive: true
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
    badgeNote: "SPRING DROP",
    isActive: true
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
    badgeNote: "LIMITED DROP",
    isActive: true
  }
];

export function HeroSlider({ slides: propSlides }: { slides?: Slide[] }) {
  // Use DB slides when provided; fall back to hardcoded defaults
  const slides = (propSlides && propSlides.length > 0) ? propSlides : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, [slides.length]);

  // Reset current index if slides array changes length (e.g. admin removed a slide)
  useEffect(() => {
    setCurrent((c) => (c >= slides.length ? 0 : c));
  }, [slides.length]);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, reducedMotion]);

  const active = slides[Math.min(current, slides.length - 1)];

  return (
    <section className="elaris-hero" aria-label="Hero slider">
      {/* MED-12: Accessible announcement mechanism for slide changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${current + 1} of ${slides.length}: ${active.kicker} - ${active.headline.join(" ")}`}
      </div>
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
