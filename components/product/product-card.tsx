"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { CatalogProduct } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useCart } from "@/components/cart/cart-provider";

const colorMap: Record<string, string> = {
  black: "#111111",
  white: "#F8F8F8",
  cream: "#F2EBE1",
  beige: "#E6DBCB",
  tan: "#D2B48C",
  brown: "#4B382A",
  olive: "#4A5240",
  charcoal: "#333333",
  pink: "#F3C5C5",
  blue: "#9BB7D4",
  green: "#A3C1AD"
};

export function ProductCard({ product, priority = false }: { product: CatalogProduct; priority?: boolean }) {
  const router = useRouter();
  const { addItem } = useCart();
  const variant = product.variants[0];
  const price = variant?.price ?? 0;
  const comparePrice = variant?.compareAtPrice;
  const discountPct = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const colors = useMemo(
    () => [...new Set(product.variants.map((item) => item.color.toLowerCase()))],
    [product.variants]
  );

  const isSale = Boolean(discountPct && discountPct > 0);
  const isNew = Boolean(
    product.tags?.some((t) => t.toLowerCase().includes("new")) ||
    product.collection?.toLowerCase().includes("new") ||
    product.name.toLowerCase().includes("blazer") ||
    product.name.toLowerCase().includes("sweater") ||
    product.name.toLowerCase().includes("dress")
  );

  const imageSrc = product.images[0]?.src || "/elaris-women.jpg";
  const imageAlt = product.images[0]?.alt || product.name;
  const secondarySrc = product.images[1]?.src ?? null;

  const [added, setAdded] = useState(false);

  const handleQuickAdd = useCallback(() => {
    const matched = product.variants[0];
    if (!matched) return;

    addItem({
      sku: matched.sku || `${product.id}_default`,
      variantId: matched.id,
      productId: product.id,
      name: product.name,
      size: matched.size || "",
      color: matched.color || colors[0] || "",
      price: matched.price ?? price,
      quantity: 1,
      image: imageSrc
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [addItem, colors, imageSrc, price, product]);

  return (
    <article className="group flex flex-col justify-between">
      <div>
        {/* Image box */}
        <div className="relative aspect-[2/3] sm:aspect-[3/4] overflow-hidden rounded-xl bg-muted/40 border border-border/60">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            {/* Primary image */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className={`object-cover transition-all duration-500 ${
                secondarySrc
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
            />
            {/* Secondary image — crossfade in on hover */}
            {secondarySrc && (
              <Image
                src={secondarySrc}
                alt={imageAlt}
                fill
                className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 pointer-events-none">
            {isNew && !isSale && (
              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-sm">
                New
              </span>
            )}
            {isSale && (
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist Button — top-right */}
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform">
              <WishlistButton
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={price}
                image={product.images[0]?.src}
                iconOnly
              />
            </div>
          </div>

          {/* Quick Add — desktop hover, directly adds first variant to cart */}
          <button
            type="button"
            aria-label={added ? "Added to bag" : "Quick add to bag"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleQuickAdd();
            }}
            className={`absolute bottom-0 left-0 right-0 z-10 hidden sm:flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-foreground/95 text-background hover:bg-foreground"
            }`}
          >
            {added ? (
              <>
                <Check size={13} strokeWidth={3} /> Added
              </>
            ) : (
              "Quick Add"
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-3 space-y-1">
          <Link
            href={`/products/${product.slug}`}
            className="block text-xs sm:text-sm font-bold text-foreground hover:underline truncate"
          >
            {product.name}
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-foreground">{formatMoney(price)}</span>
            {comparePrice && (
              <span className="text-muted-foreground line-through text-[11px]">
                {formatMoney(comparePrice)}
              </span>
            )}
            {discountPct && discountPct > 0 ? (
              <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">
                {discountPct}% OFF
              </span>
            ) : null}
          </div>

          {/* Color swatches + mobile add button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  role="img"
                  className="h-3 w-3 rounded-full border border-black/20 shadow-inner"
                  style={{ backgroundColor: colorMap[c] || "#111111" }}
                  aria-label={c}
                />
              ))}
            </div>
            {/* Mobile — tap to navigate to PDP */}
            <button
              type="button"
              aria-label="Add to bag"
              onClick={() => router.push(`/products/${product.slug}`)}
              className="sm:hidden flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <ShoppingBag size={13} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
