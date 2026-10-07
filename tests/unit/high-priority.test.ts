import { describe, it, expect, vi } from "vitest";
import { InMemoryRateLimiter } from "@/lib/rate-limit/rate-limit";
import { matchProducts } from "@/lib/ai/recommendation";
import * as catalogData from "@/features/catalog/data";

describe("HIGH-01, HIGH-02, HIGH-03: Rate Limiting", () => {
  it("enforces order rate limits and rejects on excess", async () => {
    const limiter = new InMemoryRateLimiter();
    const key = "orders:user_123";

    for (let i = 0; i < 5; i++) {
      const res = await limiter.consume(key, 5, 60_000);
      expect(res.allowed).toBe(true);
    }

    const excess = await limiter.consume(key, 5, 60_000);
    expect(excess.allowed).toBe(false);
    expect(excess.remaining).toBe(0);
  });

  it("enforces wishlist mutation rate limits", async () => {
    const limiter = new InMemoryRateLimiter();
    const key = "wishlist:user_456";

    for (let i = 0; i < 30; i++) {
      const res = await limiter.consume(key, 30, 60_000);
      expect(res.allowed).toBe(true);
    }

    const excess = await limiter.consume(key, 30, 60_000);
    expect(excess.allowed).toBe(false);
  });

  it("enforces coupon validation rate limits to stop enumeration", async () => {
    const limiter = new InMemoryRateLimiter();
    const key = "coupon-validate:192.168.1.1";

    for (let i = 0; i < 10; i++) {
      const res = await limiter.consume(key, 10, 60_000);
      expect(res.allowed).toBe(true);
    }

    const excess = await limiter.consume(key, 10, 60_000);
    expect(excess.allowed).toBe(false);
  });
});

describe("HIGH-07: AI Product Matching bounded query", () => {
  it("queries with bounded perPage limit", async () => {
    const spy = vi.spyOn(catalogData, "getFilteredProducts").mockResolvedValue({
      products: [
        {
          id: "p1",
          name: "Casual Linen Shirt",
          slug: "casual-linen-shirt",
          category: "Men",
          categorySlug: "men",
          collection: "Summer",
          description: "Comfortable linen shirt",
          material: "Linen",
          care: "Machine wash",
          tags: ["shirt"],
          images: [{ src: "/img.jpg", alt: "Shirt" }],
          variants: [{ id: "v1", sku: "S1", color: "white", size: "M", price: 200000, stock: 10 }]
        }
      ],
      total: 1
    });

    const matches = await matchProducts({ category: "Men", color: "white" }, 3);
    expect(matches.length).toBeGreaterThan(0);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Men", color: "white" }),
      expect.objectContaining({ perPage: 25 })
    );
  });
});
