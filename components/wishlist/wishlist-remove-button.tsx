"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

/**
 * Small client button that removes a product from the wishlist.
 * Used by the server-rendered wishlist page to get the remove interaction.
 * Calls the provider's removeItem (which also fires DELETE /api/wishlist),
 * then refreshes the page so the server component re-renders with fresh DB data.
 */
export function WishlistRemoveButton({ productId }: { productId: string }) {
  const { removeItem } = useWishlist();
  const router = useRouter();

  async function handleRemove() {
    removeItem(productId);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white text-rose-500 transition-colors"
      aria-label="Remove from wishlist"
    >
      <Heart size={14} className="fill-current" />
    </button>
  );
}
