import { describe, expect, it, vi } from "vitest";
import { detectShoppingIntent } from "@/lib/ai/intent";
import * as catalogData from "@/features/catalog/data";
import { matchProducts } from "@/lib/ai/recommendation";

vi.spyOn(catalogData, "getAllProducts").mockResolvedValue([
  {
    id: "prod_black_linen_shirt",
    name: "Black Linen Shirt",
    slug: "black-linen-shirt",
    category: "Men",
    categorySlug: "men",
    collection: "Current Collection",
    description: "A breathable black shirt with a relaxed collar.",
    material: "linen",
    care: "wash cold",
    tags: ["shirt", "black"],
    images: [{ src: "/shirt.jpg", alt: "Black shirt" }],
    variants: [
      { sku: "BLS-M", color: "black", size: "M", price: 245000, stock: 5 }
    ]
  }
]);

describe("grounded AI matching", () => {
  it("extracts structured filters from natural language", () => {
    const result = detectShoppingIntent("Find a black shirt under 3000 taka in M");

    expect(result.intent).toBe("PRODUCT_SEARCH");
    expect(result.filters).toMatchObject({
      color: "black",
      category: "shirt",
      maxPrice: 300000,
      size: "M"
    });
  });

  it("returns only catalog-backed products", async () => {
    const result = await matchProducts({
      color: "black",
      category: "shirt",
      maxPrice: 300000
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].product.slug).toBe("black-linen-shirt");
  });
});
