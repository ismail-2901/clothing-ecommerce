import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getServerSession } from "@/lib/auth/server";
import { cookies } from "next/headers";

const ANON_COOKIE = "cart_anon_id";

// POST /api/cart/clear — remove all items from the active cart (BUG-16 fix)
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(ANON_COOKIE)?.value;

  const where = session?.userId
    ? { userId: session.userId, status: "ACTIVE" as const }
    : anonymousId
      ? { anonymousId, status: "ACTIVE" as const }
      : null;

  if (!where) {
    return NextResponse.json({ cleared: 0 });
  }

  const cart = await prisma.cart.findFirst({ where, select: { id: true } });
  if (!cart) {
    return NextResponse.json({ cleared: 0 });
  }

  const { count } = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ cleared: count });
}
