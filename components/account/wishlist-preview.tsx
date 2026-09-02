"use client";

import { useWishlist } from "@/components/wishlist/wishlist-provider";

export function WishlistPreview() {
  const { items, removeItem } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-border p-6 text-sm text-muted-foreground">
        No saved items yet. Add products from the shop to keep your favorites here.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.productId} className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.price}</p>
            </div>
            <button
              type="button"
              className="rounded-md p-2 hover:bg-muted"
              onClick={() => removeItem(item.productId)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
