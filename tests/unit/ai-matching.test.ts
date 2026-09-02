import { describe, expect, it } from "vitest";
import { detectShoppingIntent } from "@/lib/ai/intent";
import { matchProducts } from "@/lib/ai/recommendation";

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

  it("returns only catalog-backed products", () => {
    const result = matchProducts({
      color: "black",
      category: "shirt",
      maxPrice: 300000
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].product.slug).toBe("black-linen-shirt");
  });
});

