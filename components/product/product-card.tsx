"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import type { CatalogProduct } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

const colorMap: Record<string, string> = {
  black: "#1c1917",
  white: "#fafaf9",
  cream: "#f5f5f4",
  beige: "#e7e5e4",
  tan: "#d6d3d1",
  brown: "#57534e",
  olive: "#44403c",
  charcoal: "#292524",
  pink: "#fecdd3",
  blue: "#93c5fd",
  green: "#a7f3d0"
};

export function ProductCard({
  product,
  priority = false
}: {
  product: CatalogProduct;
  priority?: boolean;
}) {
  const router = useRouter();
  const variant = product.variants[0];
  const price = variant?.price ?? 0;
  const comparePrice = variant?.compareAtPrice;
  const discountPct =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color.toLowerCase()))],
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

  return (
    <article className="group flex flex-col justify-between">
      <div>
        {/* Standardized 3:4 Apparel Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted/40 border border-border/70">
          <Link
            href={`/products/${product.slug}`}
            className="block h-full w-full"
            aria-label={`View ${product.name}`}
          >
            {/* Primary Image with Max 1.03 Scale */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className={`object-cover object-top transition-all duration-700 ease-out ${
                secondarySrc
                  ? "group-hover:opacity-0 group-hover:scale-[1.03]"
                  : "group-hover:scale-[1.03]"
              }`}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIRAAAQMEAgMAAAAAAAAAAAAAAQIDBAAFERIhMVH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmWa7Q2m1sNx2240OJbJKlDuWoAE89q1tJaNtKDMqbkvvEnBUtRJP61oooCVem0QcuH4NKKKAf//Z"
            />

            {/* Secondary Crossfade Image on Hover */}
            {secondarySrc && (
              <Image
                src={secondarySrc}
                alt={imageAlt}
                fill
                loading="lazy"
                className="object-cover object-top opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              />
            )}
          </Link>

          {/* Luxury Promotional / Status Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
            {isNew && !isSale && (
              <span className="rounded-full bg-stone-900/90 text-stone-100 backdrop-blur-md px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-widest shadow-xs">
                New
              </span>
            )}
            {isSale && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 backdrop-blur-md px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shadow-xs">
                Sale
              </span>
            )}
          </div>

          {/* Floating Wishlist Button with 44px Mobile Touch Target */}
          <div
            className="absolute right-2 top-2 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur-md shadow-subtle border border-border/80 hover:bg-background hover:scale-105 active:scale-95 transition-all">
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

          {/* Desktop Slide-up Quick View Button */}
          <div className="absolute inset-x-2.5 bottom-2.5 z-20 hidden sm:block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/products/${product.slug}`);
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-background/95 backdrop-blur-md text-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={13} />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Information Hierarchy */}
        <div className="mt-3 space-y-1">
          <Link
            href={`/products/${product.slug}`}
            className="block text-xs sm:text-[13px] font-semibold text-foreground hover:text-stone-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
            <span className="font-bold text-foreground text-xs sm:text-sm">
              {formatMoney(price)}
            </span>
            {comparePrice && (
              <span className="text-muted-foreground line-through text-[11px]">
                {formatMoney(comparePrice)}
              </span>
            )}
            {discountPct && discountPct > 0 ? (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 text-[9px] font-semibold text-amber-900 tracking-wider">
                {discountPct}% OFF
              </span>
            ) : null}
          </div>

          {/* Color Swatches & Mobile Quick Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  role="img"
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-black/15 shadow-inner"
                  style={{ backgroundColor: colorMap[c] || "#1c1917" }}
                  aria-label={c}
                />
              ))}
            </div>

            {/* Mobile Touch Target 44x44px Quick Action */}
            <div className="sm:hidden -mr-2 -my-2">
              <button
                type="button"
                aria-label={`View ${product.name}`}
                onClick={() => router.push(`/products/${product.slug}`)}
                className="flex h-11 w-11 items-center justify-center text-foreground hover:text-stone-600 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-xs">
                  <ShoppingBag size={13} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
