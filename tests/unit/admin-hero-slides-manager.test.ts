import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

import { AdminHeroSlidesManager } from "@/components/admin/admin-hero-slides-manager";

describe("AdminHeroSlidesManager mobile slide actions", () => {
  it("keeps delete control visible and touch-sized on mobile", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminHeroSlidesManager, {
        initialSlides: [{
          id: "slide-1",
          num: "01",
          kicker: "New Season",
          headline: ["Wear Your", "Story"],
          subline: "Made for you.",
          ctaText: "Shop Now",
          ctaHref: "/shop",
          image: "/hero.jpg",
          alt: "Hero",
          badgeDiscount: "",
          badgeNote: "",
          isActive: true
        }]
      })
    );

    const deleteButton = html.match(/<button[^>]*aria-label="Delete slide"[^>]*>/)?.[0];

    expect(deleteButton).toBeDefined();
    expect(deleteButton).toContain("opacity-100");
    expect(deleteButton).toContain("min-h-11");
    expect(deleteButton).toContain("min-w-11");
    expect(deleteButton).toContain("shrink-0");
  });
});
