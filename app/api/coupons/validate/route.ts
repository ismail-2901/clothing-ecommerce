import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { calculateCartTotals, type CouponRule } from "@/features/pricing/pricing";

const schema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  /** Subtotal in minor units (paisa / cents). Required to calculate actual discount. */
  cartSubtotal: z.number().int().min(0),
  /** Shipping fee in minor units. Needed for FREE_SHIPPING coupon calculation. */
  shippingFee: z.number().int().min(0).default(0)
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a coupon code and cart subtotal." }, { status: 422 });
  }

  const { code, cartSubtotal, shippingFee } = parsed.data;
  const now = new Date();

  const coupon = await prisma.coupon.findUnique({
    where: { code, status: "ACTIVE", deletedAt: null }
  });

  if (!coupon) {
    return NextResponse.json({ error: "Coupon code not found.", valid: false }, { status: 404 });
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "Coupon is not active yet.", valid: false }, { status: 400 });
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return NextResponse.json({ error: "This coupon has expired.", valid: false }, { status: 400 });
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit.", valid: false }, { status: 400 });
  }

  if (coupon.minSubtotal !== null && cartSubtotal < coupon.minSubtotal) {
    const minFormatted = (coupon.minSubtotal / 100).toFixed(0);
    return NextResponse.json(
      { error: `Minimum order ৳${minFormatted} required for this coupon.`, valid: false },
      { status: 400 }
    );
  }

  // Run pricing engine to calculate real discount amount
  const couponRule: CouponRule = {
    code: coupon.code,
    kind: coupon.type as CouponRule["kind"],
    value: coupon.value,
    minSubtotal: coupon.minSubtotal ?? undefined,
    maxDiscount: coupon.maxDiscount ?? undefined,
    startsAt: coupon.startsAt ?? undefined,
    endsAt: coupon.endsAt ?? undefined
  };

  let discountAmount = 0;
  try {
    const pricing = calculateCartTotals({
      lines: [
        // Single synthetic line representing the whole cart subtotal
        { id: "__cart__", productId: "__cart__", name: "Cart", unitPrice: cartSubtotal, quantity: 1 }
      ],
      coupon: couponRule,
      shippingFee
    });
    discountAmount = pricing.couponDiscount;
  } catch {
    // minSubtotal or date check already done above; this means coupon doesn't apply to cart
    return NextResponse.json({ error: "Coupon does not apply to this cart.", valid: false }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    title: coupon.title,
    kind: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxDiscount: coupon.maxDiscount,
    discountAmount
  });
}
