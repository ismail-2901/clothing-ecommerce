"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import type { CatalogProduct } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

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
  const variant = product.variants[0];
  const price = variant?.price ?? 0;
  const comparePrice = variant?.compareAtPrice;
  const discountPct = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const colors = [...new Set(product.variants.map((item) => item.color.toLowerCase()))];

  const isSale = Boolean(discountPct && discountPct > 0);
  const isNew = product.name.toLowerCase().includes("blazer") || product.name.toLowerCase().includes("sweater") || product.name.toLowerCase().includes("dress");

  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const imgBoxRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgBoxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => setZoom(null), []);

  const imageSrc = product.images[0]?.src || "/elaris-women.jpg";
  const imageAlt = product.images[0]?.alt || product.name;

  return (
    <article className="group flex flex-col justify-between">
      <div>
        {/* aspect-[2/3] on mobile for taller, more visible product image */}
        <div
          ref={imgBoxRef}
          className="relative aspect-[2/3] sm:aspect-[3/4] overflow-hidden rounded-xl bg-muted/40 border border-border/60 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
            />
          </Link>

          {/* PC Zoom Lens */}
          {zoom && (
            <div
              className="pointer-events-none absolute hidden sm:block rounded-full border-2 border-white/80 shadow-2xl overflow-hidden"
              style={{
                width: 140,
                height: 140,
                left: `calc(${zoom.x}% - 70px)`,
                top: `calc(${zoom.y}% - 70px)`,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: "350% 350%",
                backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                backgroundRepeat: "no-repeat",
                zIndex: 20,
                boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.5)",
              }}
            />
          )}

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

          {/* Wishlist Button */}
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform">
              <WishlistButton
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={price}
                image={product.images[0]?.src}
              />
            </div>
          </div>
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
              <span className="rounded bg-black px-1.5 py-0.2 text-[9px] font-bold text-white">
                {discountPct}% OFF
              </span>
            ) : null}
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5 pt-1">
            {colors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="h-3 w-3 rounded-full border border-black/20 shadow-inner"
                style={{ backgroundColor: colorMap[c] || "#111111" }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
