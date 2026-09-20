import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducts } from "@/features/catalog/data";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

export async function GET(request: NextRequest) {
  // BUG-34 FIX: Rate limit public products listing endpoint (120 req/min per IP)
  const ip = getClientIp(request);
  const rl = await rateLimiter.consume(`products-list:${ip}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

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
