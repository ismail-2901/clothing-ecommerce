import { NextResponse } from "next/server";
import { getFilteredProducts } from "@/features/catalog/data";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { getClientIp } from "@/lib/auth/otp";

export const runtime = "nodejs";

// E3: Autocomplete suggestions endpoint — returns up to 5 products with image + price
export async function GET(request: Request) {
  const ip = getClientIp(request);
  // 120 autocomplete requests per minute per IP
  const rl = await rateLimiter.consume(`suggest:${ip}`, 120, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  // Require at least 2 characters to avoid triggering on single keystrokes
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const { products } = await getFilteredProducts({ q }, { page: 1, perPage: 5 });

  const suggestions = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.variants[0]?.price ?? 0,
    image: p.images[0]?.src ?? null,
    category: p.category
  }));

  return NextResponse.json({ suggestions });
}
