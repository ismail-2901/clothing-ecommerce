export type DiscountKind = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export type CartPricingLine = {
  id: string;
  productId: string;
  categoryId?: string;
  collectionId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CouponRule = {
  code: string;
  kind: DiscountKind;
  value: number;
  minSubtotal?: number;
  startsAt?: Date;
  endsAt?: Date;
  appliesToProductIds?: string[];
  appliesToCategoryIds?: string[];
  appliesToCollectionIds?: string[];
  maxDiscount?: number;
};

export type PricingInput = {
  lines: CartPricingLine[];
  coupon?: CouponRule;
  shippingFee: number;
  now?: Date;
};

export type PricingResult = {
  subtotal: number;
  itemDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  grandTotal: number;
  appliedCouponCode?: string;
};

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export function calculateCartTotals(input: PricingInput): PricingResult {
  const now = input.now ?? new Date();
  const subtotal = input.lines.reduce((total, line) => {
    assertValidLine(line);
    return total + line.unitPrice * line.quantity;
  }, 0);

  const couponDiscount = input.coupon
    ? calculateCouponDiscount(input.lines, subtotal, input.shippingFee, input.coupon, now)
    : 0;
  const shippingFee = input.coupon?.kind === "FREE_SHIPPING" && couponDiscount > 0 ? 0 : input.shippingFee;
  const grandTotal = Math.max(0, subtotal + shippingFee - couponDiscount);

  return {
    subtotal,
    itemDiscount: 0,
    couponDiscount,
    shippingFee,
    grandTotal,
    appliedCouponCode: couponDiscount > 0 ? input.coupon?.code : undefined
  };
}

function calculateCouponDiscount(
  lines: CartPricingLine[],
  subtotal: number,
  shippingFee: number,
  coupon: CouponRule,
  now: Date
) {
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new PricingError("Coupon is not active yet.");
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    throw new PricingError("Coupon has expired.");
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    throw new PricingError("Cart does not meet the coupon minimum spend.");
  }

  const eligibleSubtotal = lines
    .filter((line) => isLineEligible(line, coupon))
    .reduce((total, line) => total + line.unitPrice * line.quantity, 0);

  if (eligibleSubtotal <= 0 && coupon.kind !== "FREE_SHIPPING") {
    throw new PricingError("Coupon does not apply to this cart.");
  }

  const discount =
    coupon.kind === "PERCENTAGE"
      ? Math.floor((eligibleSubtotal * coupon.value) / 100)
      : coupon.kind === "FIXED_AMOUNT"
        ? Math.min(coupon.value, eligibleSubtotal)
        : shippingFee;

  return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
}

function isLineEligible(line: CartPricingLine, coupon: CouponRule) {
  const hasScopedRule =
    Boolean(coupon.appliesToProductIds?.length) ||
    Boolean(coupon.appliesToCategoryIds?.length) ||
    Boolean(coupon.appliesToCollectionIds?.length);

  if (!hasScopedRule) {
    return true;
  }

  return (
    coupon.appliesToProductIds?.includes(line.productId) ||
    (line.categoryId ? coupon.appliesToCategoryIds?.includes(line.categoryId) : false) ||
    (line.collectionId ? coupon.appliesToCollectionIds?.includes(line.collectionId) : false)
  );
}

function assertValidLine(line: CartPricingLine) {
  if (!Number.isInteger(line.unitPrice) || line.unitPrice < 0) {
    throw new PricingError("Invalid line price.");
  }

  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new PricingError("Invalid line quantity.");
  }
}

