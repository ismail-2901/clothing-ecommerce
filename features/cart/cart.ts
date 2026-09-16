import { calculateCartTotals, type CouponRule, type PricingResult } from "@/features/pricing/pricing";

export type CartItem = {
  id?: string;
  sku: string;
  variantId?: string;
  productId: string;
  name: string;
  productName?: string;
  productSlug?: string;
  size: string;
  color: string;
  price: number;
  unitPrice?: number;
  quantity: number;
  lineTotal?: number;
  image?: string;
  available?: boolean;
};

export type CartItemInput = {
  id?: string;
  sku: string;
  variantId?: string;
  productId: string;
  name: string;
  productName?: string;
  productSlug?: string;
  size: string;
  color: string;
  price?: number | string;
  unitPrice?: number | string;
  quantity: number | string;
  image?: string;
  available?: boolean;
};

export type CartSummaryInput = {
  items: CartItem[];
  shippingFee: number;
  coupon?: CouponRule;
  now?: Date;
};

export function normalizeCartItem(input: CartItemInput): CartItem {
  const quantity = Number(input.quantity);
  const rawPrice = Number(input.price ?? input.unitPrice ?? 0);
  const effectivePrice = Number.isFinite(rawPrice) && rawPrice > 0 ? Math.round(rawPrice) : 0;

  const item: CartItem = {
    sku: input.sku,
    productId: input.productId,
    name: (input.name || input.productName || "").trim(),
    size: input.size.trim().toUpperCase(),
    color: input.color.trim().toLowerCase(),
    price: effectivePrice,
    quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
    image: input.image ?? ""
  };

  if (input.id) item.id = input.id;
  if (input.variantId) item.variantId = input.variantId;
  if (input.unitPrice !== undefined) item.unitPrice = Number(input.unitPrice);
  if (input.productName) item.productName = input.productName;
  if (input.productSlug) item.productSlug = input.productSlug;
  if (input.available !== undefined) item.available = input.available;

  return item;
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
    unitPrice: item.unitPrice ?? item.price,
    quantity: item.quantity
  }));

  return calculateCartTotals({
    lines,
    shippingFee: input.shippingFee,
    coupon: input.coupon,
    now: input.now
  });
}

