import { NextResponse } from "next/server";
import { getFilteredProducts } from "@/features/catalog/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const color = url.searchParams.get("color") ?? undefined;
  const size = url.searchParams.get("size") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;

  const products = await getFilteredProducts({ q, color, size, category });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.variants[0]?.price ?? 0,
      inStock: product.variants.some((variant) => variant.stock > 0)
    }))
  });
}
