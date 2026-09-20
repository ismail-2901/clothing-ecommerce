import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";

const ANON_COOKIE = "cart_anon_id";

// POST /api/cart/merge
// Called client-side after successful login.
// Merges the anonymous cart into the authenticated user cart; deletes the anon cart.
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(ANON_COOKIE)?.value;

  if (!anonymousId) {
    return NextResponse.json({ merged: 0 });
  }

  const anonCart = await prisma.cart.findFirst({
    where: { anonymousId, status: "ACTIVE" },
    include: { items: { include: { variant: true } } }
  });

  if (!anonCart || anonCart.items.length === 0) {
    const response = NextResponse.json({ merged: 0 });
    response.cookies.set(ANON_COOKIE, "", { maxAge: 0 });
    return response;
  }

  let userCart = await prisma.cart.findFirst({
    where: { userId: session.userId, status: "ACTIVE" },
    include: { items: true }
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: { userId: session.userId, status: "ACTIVE" },
      include: { items: true }
    });
  }

  let mergedCount = 0;

  for (const anonItem of anonCart.items) {
    const variant = anonItem.variant;
    const available = variant.stockQuantity - variant.reservedQuantity;
    if (available <= 0 || !variant.isAvailable) continue;

    const existingItem = userCart.items.find((i) => i.variantId === anonItem.variantId);
    const existingQty = existingItem?.quantity ?? 0;
    const finalQty = Math.min(existingQty + anonItem.quantity, available);

    if (finalQty <= 0) continue;

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: userCart.id, variantId: anonItem.variantId } },
      create: { cartId: userCart.id, variantId: anonItem.variantId, quantity: finalQty },
      update: { quantity: finalQty }
    });

    mergedCount++;
  }

  // BUG-35 FIX: Soft-retire the anonymous cart as CHECKED_OUT rather than hard-deleting
  // to avoid cascading deletion of related audit records or abandoned checkouts
  await prisma.cart.update({ where: { id: anonCart.id }, data: { status: "CHECKED_OUT" } });

  const response = NextResponse.json({ merged: mergedCount });
  response.cookies.set(ANON_COOKIE, "", { maxAge: 0, httpOnly: true, sameSite: "lax" });
  return response;
}
