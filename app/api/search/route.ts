import { NextResponse } from "next/server";
import { getFilteredProducts } from "@/features/catalog/data";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

export async function GET(request: Request) {
  // BUG-34 FIX: Rate limit public search queries (60 req/min per IP)
  const ip = getClientIp(request);
  const rl = await rateLimiter.consume(`search:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Please slow down." },
      { status: 429 }
    );
  }

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
