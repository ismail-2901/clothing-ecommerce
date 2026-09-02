import { calculateCartTotals, type CouponRule, type PricingResult } from "@/features/pricing/pricing";

export type CartItem = {
  sku: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CartItemInput = {
  sku: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  price: number | string;
  quantity: number | string;
  image?: string;
};

export type CartSummaryInput = {
  items: CartItem[];
  shippingFee: number;
  coupon?: CouponRule;
  now?: Date;
};

export function normalizeCartItem(input: CartItemInput): CartItem {
  const quantity = Number(input.quantity);
  const price = Number(input.price);

  return {
    sku: input.sku,
    productId: input.productId,
    name: input.name.trim(),
    size: input.size.trim().toUpperCase(),
    color: input.color.trim().toLowerCase(),
    price: Number.isFinite(price) ? Math.round(price) : 0,
    quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
    image: input.image ?? ""
  };
}

export function addCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const normalized = normalizeCartItem({
    ...item,
    price: item.price,
    quantity: item.quantity
  });

  const index = items.findIndex((existing) => existing.sku === normalized.sku);

  if (index === -1) {
    return [...items, normalized];
  }

  const nextItems = [...items];
  nextItems[index] = {
    ...nextItems[index],
    quantity: nextItems[index].quantity + normalized.quantity,
    price: normalized.price
  };

  return nextItems;
}

export function calculateCartSummary(input: CartSummaryInput): PricingResult {
  const lines = input.items.map((item) => ({
    id: item.sku,
    productId: item.productId,
    name: item.name,
    unitPrice: item.price,
    quantity: item.quantity
  }));

  return calculateCartTotals({
    lines,
    shippingFee: input.shippingFee,
    coupon: input.coupon,
    now: input.now
  });
}
