export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  addedAt: string;
};

export function addWishlistItem(items: WishlistItem[], item: Omit<WishlistItem, "addedAt">): WishlistItem[] {
  const normalized = { ...item, addedAt: new Date().toISOString() };

  if (items.some((existing) => existing.productId === normalized.productId)) {
    return items;
  }

  return [normalized, ...items];
}

export function removeWishlistItem(items: WishlistItem[], productId: string) {
  return items.filter((item) => item.productId !== productId);
}

export function toggleWishlistItem(items: WishlistItem[], item: Omit<WishlistItem, "addedAt">) {
  const exists = items.some((existing) => existing.productId === item.productId);

  return exists ? removeWishlistItem(items, item.productId) : addWishlistItem(items, item);
}
