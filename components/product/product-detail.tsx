"use client";

import Image from "next/image";
import { Ruler, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { CatalogProduct } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color ?? "");
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size ?? "");

  const colors = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.color))],
    [product.variants]
  );

  const availableSizes = useMemo(
    () => product.variants.filter((variant) => variant.color === selectedColor),
    [product.variants, selectedColor]
  );

  const activeVariant =
    product.variants.find(
      (variant) => variant.color === selectedColor && variant.size === selectedSize
    ) ?? availableSizes[0] ?? product.variants[0];

  const handleAddToCart = () => {
    if (!activeVariant) {
      return;
    }

    addItem({
      sku: activeVariant.sku,
      productId: product.id,
      name: product.name,
      size: activeVariant.size,
      color: activeVariant.color,
      price: activeVariant.price,
      quantity: 1,
      image: product.images[0]?.src ?? ""
    });
  };

  return (
    <div className="container-shell grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid gap-4 sm:grid-cols-2">
        {product.images.map((image, index) => (
          <div
            key={image.src}
            className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 30vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {product.collection}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-semibold">{formatMoney(activeVariant.price)}</span>
          {activeVariant.compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(activeVariant.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">{product.description}</p>

        <div className="mt-8 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Color</h2>
              <span className="text-sm text-muted-foreground">{activeVariant.color}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`h-10 min-w-16 rounded-md border px-3 text-sm capitalize ${
                    selectedColor === color ? "border-foreground bg-foreground text-background" : "border-border"
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    const nextSize = product.variants.find(
                      (variant) => variant.color === color && variant.stock > 0
                    )?.size;
                    if (nextSize) {
                      setSelectedSize(nextSize);
                    }
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Size</h2>
              <button className="inline-flex items-center gap-2 text-sm underline" type="button">
                <Ruler aria-hidden="true" size={16} />
                Size guide
              </button>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {availableSizes.map((variant) => (
                <button
                  key={variant.sku}
                  className={`h-11 rounded-md border text-sm font-medium disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${
                    selectedSize === variant.size ? "border-foreground bg-foreground text-background" : "border-border"
                  }`}
                  disabled={variant.stock <= 0}
                  type="button"
                  onClick={() => setSelectedSize(variant.size)}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Truck aria-hidden="true" size={18} />
              Delivery and returns
            </div>
            <p className="mt-2 leading-6 text-muted-foreground">
              Delivery estimates and return windows are configurable from the admin content settings.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button size="lg" onClick={handleAddToCart}>
              <ShoppingBag aria-hidden="true" size={18} />
              Add to cart
            </Button>
            <WishlistButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={activeVariant.price}
              image={product.images[0]?.src}
              variant="detail"
            />
          </div>
        </div>

        <div className="mt-8 divide-y divide-border border-y border-border text-sm">
          {[
            ["Materials", product.material],
            ["Care", product.care],
            ["SKU", activeVariant.sku]
          ].map(([title, copy]) => (
            <div key={title} className="grid gap-2 py-4 sm:grid-cols-[120px_1fr]">
              <h2 className="font-semibold">{title}</h2>
              <p className="text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
