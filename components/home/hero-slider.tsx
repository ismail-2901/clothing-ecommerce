"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import type { HeroSlideData } from "@/lib/cache/db-cache";

type Slide = HeroSlideData;

export function shouldAutoplayHero({
  reducedMotion,
  hasInteracted
}: {
  reducedMotion: boolean;
  hasInteracted: boolean;
}) {
  return !reducedMotion && hasInteracted;
}

// Fallback slides — used when no DB data exists (fresh install)
const DEFAULT_SLIDES: Slide[] = [
  {
    id: "slide-1",
    num: "01",
    kicker: "New Season '25",
    headline: ["Wear Your", "Story"],
    subline: "Minimalist architecture and breathable luxury textiles engineered for modern presence.",
    ctaText: "Shop New In",
    ctaHref: "/shop",
    image: "/elaris-hero.jpg",
    alt: "Man in Elaris black sweatshirt and cap",
    badgeDiscount: "30%",
    badgeNote: "Selected Items",
    isActive: true
  },
  {
    id: "slide-2",
    num: "02",
    kicker: "Spring Essentials",
    headline: ["Form &", "Function"],
    subline: "Clean lines, tactile knitwear, and effortless drape tailored for everyday elegance.",
    ctaText: "Shop Collection",
    ctaHref: "/shop?category=women",
    image: "/elaris-women.jpg",
    alt: "Woman in Elaris modern knitwear",
    badgeDiscount: "25%",
    badgeNote: "Spring Capsule",
    isActive: true
  },
  {
    id: "slide-3",
    num: "03",
    kicker: "Urban Signature",
    headline: ["Timeless", "Comfort"],
    subline: "Understated streetwear essentials and heavyweight fleece designed to endure.",
    ctaText: "Explore Men",
    ctaHref: "/shop?category=men",
    image: "/elaris-men.jpg",
    alt: "Man in Elaris urban streetwear",
    badgeDiscount: "20%",
    badgeNote: "Signature Drop",
    isActive: true
  }
];

export function HeroSlider({ slides: propSlides }: { slides?: Slide[] }) {
  // Use DB slides when provided; fall back to hardcoded defaults
  const slides = propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const prevSlide = useCallback(() => {
    setHasInteracted(true);
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setHasInteracted(true);
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, [slides.length]);

  const selectSlide = useCallback((index: number) => {
    setHasInteracted(true);
    setCurrent(index);
  }, []);

  // Reset current index if slides array changes length
  useEffect(() => {
    setCurrent((c) => (c >= slides.length ? 0 : c));
  }, [slides.length]);

  // Autoplay after initial interaction
  useEffect(() => {
    if (!shouldAutoplayHero({ reducedMotion, hasInteracted })) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, [hasInteracted, reducedMotion, slides.length]);

  const active = slides[Math.min(current, slides.length - 1)];

  return (
    <section className="elaris-hero w-full border-b border-border bg-background" aria-label="Hero slider">
      {/* Accessible live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${current + 1} of ${slides.length}: ${active.kicker} - ${active.headline.join(" ")}`}
      </div>

      <div className="elaris-hero-grid">
        {/* Left Column: High-fashion Editorial Copy & Integrated Progress */}
        <div className="elaris-hero-left">
          <div className="elaris-hero-text transition-opacity duration-300">
            {/* Kicker & Naturally Integrated Promotional Pill */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="elaris-kicker mb-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {active.kicker}
              </span>
              {active.badgeDiscount && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 tracking-wide">
                  <Sparkles size={11} className="text-amber-700" />
                  <span>Up to {active.badgeDiscount} Off · {active.badgeNote}</span>
                </span>
              )}
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="elaris-headline font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.03] mb-4">
              <span className="block">{active.headline[0]}</span>
              <span className="block font-normal italic text-stone-600">{active.headline[1]}</span>
            </h1>

            {/* Subline */}
            <p className="elaris-subline text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-8">
              {active.subline}
            </p>

            {/* Primary Action Button */}
            <div className="pt-1">
              <Link href={active.ctaHref} className="elaris-cta-link group inline-flex items-center gap-3">
                <span>{active.ctaText}</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Refined Slide Progress Indicators with Animated Line Transitions */}
          <div className="elaris-slide-bar mt-10 lg:mt-14 pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-5">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSlide(idx)}
                  className="group flex flex-col gap-1.5 py-2 text-left cursor-pointer transition-opacity"
                  aria-label={`Go to slide ${s.num}: ${s.kicker}`}
                  aria-current={idx === current ? "true" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tracking-widest transition-colors ${
                        idx === current
                          ? "text-foreground"
                          : "text-muted-foreground/60 group-hover:text-foreground"
                      }`}
                    >
                      {s.num}
                    </span>
                    {idx === current && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:inline">
                        {s.kicker}
                      </span>
                    )}
                  </div>
                  <div className="h-[2px] w-12 sm:w-16 bg-border overflow-hidden rounded-full">
                    <div
                      className={`h-full bg-foreground transition-all duration-500 ease-out ${
                        idx === current ? "w-full" : "w-0 group-hover:w-1/3"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Slide Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted hover:border-foreground/40 transition-colors"
                aria-label="Previous slide"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted hover:border-foreground/40 transition-colors"
                aria-label="Next slide"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: High-fashion Campaign Imagery */}
        <div className="elaris-hero-img-col relative overflow-hidden bg-muted">
          <Image
            src={active.image}
            alt={active.alt}
            fill
            className="object-cover object-top transition-opacity duration-700 ease-in-out"
            priority
            fetchPriority="high"
            sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
