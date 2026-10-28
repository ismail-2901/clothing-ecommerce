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
  variant,
  iconOnly = false
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  variant?: "card" | "detail";
  iconOnly?: boolean;
}) {
  const { isSaved, toggleItem } = useWishlist();
  const saved = isSaved(productId);

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() =>
          toggleItem({
            productId,
            slug,
            name,
            price,
            image: image ?? ""
          })
        }
        aria-label={saved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
        className="flex items-center justify-center w-full h-full"
      >
        <Heart
          aria-hidden="true"
          size={16}
          fill={saved ? "currentColor" : "none"}
          className={saved ? "text-rose-500" : "text-foreground"}
        />
      </button>
    );
  }

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
