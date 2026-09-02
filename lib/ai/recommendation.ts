import { getAllProducts, type CatalogProduct } from "@/features/catalog/data";
import type { ProductFilters } from "@/lib/ai/schemas";

export type ProductMatch = {
  product: CatalogProduct;
  score: number;
  reasons: string[];
};

export function matchProducts(filters: ProductFilters, limit = 3): ProductMatch[] {
  return getAllProducts()
    .map((product) => scoreProduct(product, filters))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function scoreProduct(product: CatalogProduct, filters: ProductFilters): ProductMatch {
  const reasons: string[] = [];
  let score = 0;
  const searchable = [
    product.name,
    product.description,
    product.category,
    product.collection,
    product.material,
    ...product.tags
  ]
    .join(" ")
    .toLowerCase();

  if (filters.category && searchable.includes(filters.category.toLowerCase())) {
    score += 25;
    reasons.push("category match");
  }

  if (filters.color && product.variants.some((variant) => variant.color === filters.color)) {
    score += 25;
    reasons.push("color match");
  }

  if (filters.size && product.variants.some((variant) => variant.size.toLowerCase() === filters.size?.toLowerCase())) {
    score += 15;
    reasons.push("size available");
  }

  if (filters.maxPrice && product.variants.some((variant) => variant.price <= filters.maxPrice!)) {
    score += 20;
    reasons.push("within budget");
  }

  if (product.variants.some((variant) => variant.stock > 0)) {
    score += 10;
    reasons.push("in stock");
  }

  if (filters.query) {
    for (const word of filters.query.toLowerCase().split(/\s+/).filter(Boolean)) {
      if (searchable.includes(word)) {
        score += 2;
      }
    }
  }

  return { product, score, reasons };
}

