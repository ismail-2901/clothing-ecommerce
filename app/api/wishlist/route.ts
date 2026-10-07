import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { z } from "zod";

const bodySchema = z.object({ productId: z.string().min(1) });

// GET /api/wishlist — returns current user's wishlist item productIds
export async function GET() {
  const session = await getServerSession();
  if (!session?.userId) {
    return NextResponse.json({ items: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.userId },
    select: { items: { select: { productId: true } } }
  });

  return NextResponse.json({ items: (wishlist?.items ?? []).map((i) => i.productId) });
}

// POST /api/wishlist — add a product to wishlist (upsert)
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // HIGH-02 FIX: Rate limit wishlist mutations (30 req/min per user)
  const rl = await rateLimiter.consume(`wishlist:${session.userId}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many wishlist updates. Please slow down." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { productId } = parsed.data;

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Upsert wishlist row for user
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId },
    update: {}
  });

  await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    create: { wishlistId: wishlist.id, productId },
    update: {}
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/wishlist — remove a product from wishlist
export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // HIGH-02 FIX: Rate limit wishlist mutations (30 req/min per user)
  const rl = await rateLimiter.consume(`wishlist:${session.userId}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many wishlist updates. Please slow down." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { productId } = parsed.data;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.userId },
    select: { id: true }
  });

  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId }
    });
  }

  return NextResponse.json({ ok: true });
}
