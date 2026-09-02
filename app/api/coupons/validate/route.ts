import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  cartTotal: z.number().int().min(0)
});

// Hardcoded coupons - replace with DB lookup after migration is active.
const validCoupons = [
  {
    code: "LAUNCH10",
    kind: "PERCENTAGE" as const,
    value: 10,
    minOrder: 0,
    usageLimit: 500,
    used: 48,
    active: true,
    expires: null as Date | null
  },
  {
    code: "SHIPFREE",
    kind: "FREE_SHIPPING" as const,
    value: 0,
    minOrder: 200000,
    usageLimit: null as number | null,
    used: 0,
    active: true,
    expires: null as Date | null
  },
  {
    code: "FIRST500",
    kind: "FIXED_AMOUNT" as const,
    value: 50000,
    minOrder: 100000,
    usageLimit: 1000,
    used: 201,
    active: false,
    expires: new Date("2024-11-30")
  }
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a coupon code and cart total." }, { status: 422 });
  }

  const { code, cartTotal } = parsed.data;
  const now = new Date();

  const coupon = validCoupons.find((c) => c.code === code);

  if (!coupon) {
    return NextResponse.json({ error: "Coupon code not found.", valid: false }, { status: 404 });
  }

  if (!coupon.active) {
    return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
  }

  if (coupon.expires && coupon.expires < now) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
  }

  if (coupon.usageLimit !== null && coupon.used >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
  }

  if (cartTotal < coupon.minOrder) {
    const min = (coupon.minOrder / 100).toFixed(0);
    return NextResponse.json({ error: `Minimum order ৳${min} required for this coupon.` }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    kind: coupon.kind,
    value: coupon.value,
    minOrder: coupon.minOrder
  });
}
