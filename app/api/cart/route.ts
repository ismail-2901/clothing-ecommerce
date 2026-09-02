import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const ANON_COOKIE = "cart_anon_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function resolveCartIdentity(request: NextRequest) {
  const session = await getServerSession();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value ?? randomUUID();
  return { userId: session?.userId ?? null, anonymousId: anonId };
}

async function getOrCreateCart(userId: string | null, anonymousId: string) {
  const where = userId
    ? { userId, status: "ACTIVE" as const }
    : { anonymousId, status: "ACTIVE" as const };

  let cart = await prisma.cart.findFirst({
    where,
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } }
            }
          }
        }
      },
      coupon: true
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, anonymousId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } }
              }
            }
          }
        },
        coupon: true
      }
    });
  }

  return cart;
}

function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const items = cart.items.map((item) => {
    const effectivePrice = item.variant.priceOverride ?? item.variant.product.basePrice;
    return {
      id: item.id,
      variantId: item.variantId,
      sku: item.variant.sku,
      productId: item.variant.productId,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      color: item.variant.color,
      size: item.variant.size,
      unitPrice: effectivePrice,
      quantity: item.quantity,
      lineTotal: effectivePrice * item.quantity,
      image: item.variant.product.images[0]?.url ?? null,
      available: item.variant.isAvailable && item.variant.stockQuantity > item.variant.reservedQuantity
    };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    coupon: cart.coupon ? { code: cart.coupon.code, title: cart.coupon.title } : null,
    itemCount: items.reduce((s, i) => s + i.quantity, 0)
  };
}

// GET /api/cart — load cart
export async function GET(request: NextRequest) {
  const { userId, anonymousId } = await resolveCartIdentity(request);
  const cart = await getOrCreateCart(userId, anonymousId);

  const response = NextResponse.json(serializeCart(cart));
  response.cookies.set(ANON_COOKIE, anonymousId, { maxAge: COOKIE_MAX_AGE, httpOnly: true, sameSite: "lax" });
  return response;
}

const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.int().min(1).max(99)
});

// POST /api/cart — add/update item
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid item data", issues: parsed.error.issues }, { status: 422 });
  }

  const { variantId, quantity } = parsed.data;

  // Validate variant exists and is available with sufficient stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId, deletedAt: null },
    include: { product: true }
  });

  if (!variant || !variant.isAvailable || variant.product.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Product variant is not available." }, { status: 422 });
  }

  const available = variant.stockQuantity - variant.reservedQuantity;
  if (available < quantity) {
    return NextResponse.json(
      { error: `Only ${available} unit(s) available.` },
      { status: 422 }
    );
  }

  const { userId, anonymousId } = await resolveCartIdentity(request);
  const cart = await getOrCreateCart(userId, anonymousId);

  // Upsert cart item — never trust client price
  const existingItem = cart.items.find((i) => i.variantId === variantId);
  const newQuantity = (existingItem?.quantity ?? 0) + quantity;
  const totalRequested = newQuantity;

  if (totalRequested > available) {
    return NextResponse.json(
      { error: `Cannot add ${quantity} more. Only ${available} available.` },
      { status: 422 }
    );
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity },
    update: { quantity: newQuantity }
  });

  const updatedCart = await getOrCreateCart(userId, anonymousId);
  const response = NextResponse.json(serializeCart(updatedCart));
  response.cookies.set(ANON_COOKIE, anonymousId, { maxAge: COOKIE_MAX_AGE, httpOnly: true, sameSite: "lax" });
  return response;
}

const removeItemSchema = z.object({
  cartItemId: z.string().min(1)
});

// DELETE /api/cart — remove item
export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = removeItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "cartItemId required" }, { status: 422 });
  }

  const { userId, anonymousId } = await resolveCartIdentity(request);
  const cart = await getOrCreateCart(userId, anonymousId);

  // Verify item belongs to this cart (IDOR protection)
  const item = cart.items.find((i) => i.id === parsed.data.cartItemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found in cart." }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: parsed.data.cartItemId } });

  const updatedCart = await getOrCreateCart(userId, anonymousId);
  const response = NextResponse.json(serializeCart(updatedCart));
  response.cookies.set(ANON_COOKIE, anonymousId, { maxAge: COOKIE_MAX_AGE, httpOnly: true, sameSite: "lax" });
  return response;
}
