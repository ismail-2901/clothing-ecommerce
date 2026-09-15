import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Elaris – Wear Your Story",
  description:
    "Elaris is a premium single-brand clothing store built around timeless design, responsible materials, and a direct relationship with our customers."
};

export default function AboutPage() {
  return (
    <div className="container-shell max-w-3xl py-12 space-y-16">
      {/* Hero */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Brand
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          More Than Clothing. Wear Your Story.
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground max-w-xl">
          Elaris was founded on a single belief: that everyday clothing should feel intentional.
          Not fast. Not disposable. Each piece in the collection is designed to earn a place in
          your wardrobe for years — not seasons.
        </p>
      </div>

      {/* Values */}
      <div className="grid gap-8 sm:grid-cols-3">
        {[
          {
            heading: "Responsible materials",
            body:
              "We source organic combed cotton, recycled polyester blends, and natural linens. Every fabric choice is made with its full lifecycle in mind."
          },
          {
            heading: "Direct to you",
            body:
              "No department store markups. No middlemen. We design, produce, and ship directly — so you get more quality for every taka you spend."
          },
          {
            heading: "Made to last",
            body:
              "Reinforced seams, colourfast dyes, and pre-washed finishes. We back every item with a 14-day return window because we're confident in what we make."
          }
        ].map((v) => (
          <div key={v.heading}>
            <h2 className="font-semibold text-sm text-foreground">{v.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="border-t border-border pt-12 space-y-4">
        <h2 className="text-xl font-semibold">The story</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          Elaris started in Dhaka in 2023, born out of frustration with a market flooded by
          trend-chasing fast fashion and a lack of thoughtfully made basics. Our founder — a
          long-time textile professional — wanted to prove that a small, focused brand could
          compete on quality rather than volume.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          Today we offer a tight, curated collection of essentials: shirts, trousers, outerwear,
          and accessories. The range grows slowly and deliberately. We never add a piece unless
          it genuinely earns its place.
        </p>
      </div>

      {/* CTA strip */}
      <div className="border-t border-border pt-10 flex flex-wrap gap-4 text-sm">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
        >
          Shop the collection
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-semibold hover:bg-muted transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
