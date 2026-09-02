"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { Button } from "@/components/ui/button";

export function WishlistButton({
  productId,
  name,
  slug,
  price,
  image,
  variant
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  variant?: "card" | "detail";
}) {
  const { isSaved, toggleItem } = useWishlist();
  const saved = isSaved(productId);

  return (
    <Button
      variant={saved ? "solid" : "outline"}
      size={variant === "detail" ? "lg" : "sm"}
      onClick={() =>
        toggleItem({
          productId,
          slug,
          name,
          price,
          image: image ?? ""
        })
      }
      type="button"
      aria-label={saved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={saved ? "bg-foreground text-background" : ""}
    >
      <Heart aria-hidden="true" size={18} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Wishlist"}
    </Button>
  );
}
