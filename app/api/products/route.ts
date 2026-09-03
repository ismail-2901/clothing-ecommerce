import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducts, getAllProducts } from "@/features/catalog/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const color = searchParams.get("color")?.trim();
  const size = searchParams.get("size")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10)));

  const products = await getFilteredProducts({ q, category, color, size });

  const total = products.length;
  const start = (page - 1) * perPage;
  const paginated = products.slice(start, start + perPage);

  return NextResponse.json({
    products: paginated.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      categorySlug: p.categorySlug,
      collection: p.collection,
      description: p.description,
      tags: p.tags,
      images: p.images,
      variants: p.variants
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  });
}
