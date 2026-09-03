"use client";

import Image from "next/image";
import { Ruler, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import type { CatalogProduct, CatalogVariant } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";

const SIZE_SORT_ORDER = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL",
  "28", "30", "32", "34", "36", "38", "40", "42",
  "EU38", "EU39", "EU40", "EU41", "EU42", "EU43", "EU44", "EU45",
  "ONE SIZE", "FREE SIZE"
];

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();

  // 1. Expand any legacy comma-separated sizes into individual clean variants
  const flatVariants = useMemo(() => {
    return product.variants.flatMap((v) => {
      const rawSize = (v.size || "").trim();
      const rawColor = (v.color || "Default").trim();
      if (!rawSize.includes(",")) {
        return [{ ...v, color: rawColor, size: rawSize }];
      }
      return rawSize
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((size) => ({ ...v, color: rawColor, size }));
    });
  }, [product.variants]);

  // 2. Distinct colors (case-insensitive deduplication)
  const colors = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const v of flatVariants) {
      const key = v.color.toLowerCase();
      if (!seen.has(key) && v.color) {
        seen.add(key);
        list.push(v.color);
      }
    }
    return list;
  }, [flatVariants]);

  const [selectedColor, setSelectedColor] = useState<string>(
    () => colors[0] ?? flatVariants[0]?.color ?? ""
  );

  // 3. Unique sizes for selected color (STRICTLY ONE BUTTON PER SIZE)
  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, CatalogVariant>();
    for (const v of flatVariants) {
      if (v.color.toLowerCase() === selectedColor.toLowerCase()) {
        const key = v.size.toLowerCase();
        const existing = sizeMap.get(key);
        // Prefer in-stock variant, or variant with higher stock
        if (!existing || v.stock > existing.stock) {
          sizeMap.set(key, v);
        }
      }
    }

    // Sort in standard fashion
    return Array.from(sizeMap.values()).sort((a, b) => {
      const idxA = SIZE_SORT_ORDER.indexOf(a.size.toUpperCase());
      const idxB = SIZE_SORT_ORDER.indexOf(b.size.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.size.localeCompare(b.size);
    });
  }, [flatVariants, selectedColor]);

  // 4. Selected size state
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const initialForColor = flatVariants.filter(
      (v) => v.color.toLowerCase() === (colors[0] ?? "").toLowerCase()
    );
    const inStock = initialForColor.find((v) => v.stock > 0);
    return inStock?.size ?? initialForColor[0]?.size ?? flatVariants[0]?.size ?? "";
  });

  // 5. Active variant for current (color, size)
  const activeVariant = useMemo(() => {
    return (
      flatVariants.find(
        (v) =>
          v.color.toLowerCase() === selectedColor.toLowerCase() &&
          v.size.toLowerCase() === selectedSize.toLowerCase()
      ) ??
      availableSizes[0] ??
      flatVariants[0]
    );
  }, [flatVariants, selectedColor, selectedSize, availableSizes]);

  // Color change handler: retains size if valid in new color, otherwise selects available size
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    const sizesInNewColor = flatVariants.filter(
      (v) => v.color.toLowerCase() === newColor.toLowerCase()
    );

    const sameSizeInStock = sizesInNewColor.find(
      (v) => v.size.toLowerCase() === selectedSize.toLowerCase() && v.stock > 0
    );
    if (sameSizeInStock) {
      setSelectedSize(sameSizeInStock.size);
      return;
    }

    const sameSizeAny = sizesInNewColor.find(
      (v) => v.size.toLowerCase() === selectedSize.toLowerCase()
    );
    if (sameSizeAny) {
      setSelectedSize(sameSizeAny.size);
      return;
    }

    const firstInStock = sizesInNewColor.find((v) => v.stock > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
    } else if (sizesInNewColor.length > 0) {
      setSelectedSize(sizesInNewColor[0].size);
    }
  };

  const handleAddToCart = () => {
    if (!activeVariant) return;

    addItem({
      sku: activeVariant.sku,
      productId: product.id,
      name: product.name,
      size: activeVariant.size,
      color: activeVariant.color,
      price: activeVariant.price,
      quantity: 1,
      image: product.images[0]?.src ?? "",
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
          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Color</h2>
                <span className="text-sm text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      className={`h-10 min-w-16 rounded-md border px-3 text-sm capitalize transition-colors ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                      type="button"
                      onClick={() => handleColorChange(color)}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Size</h2>
              <button className="inline-flex items-center gap-2 text-sm underline" type="button">
                <Ruler aria-hidden="true" size={16} />
                Size guide
              </button>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {availableSizes.map((variant) => {
                const isSelected = selectedSize.toLowerCase() === variant.size.toLowerCase();
                return (
                  <button
                    key={`${variant.color}-${variant.size}`}
                    className={`h-11 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                    disabled={variant.stock <= 0}
                    type="button"
                    onClick={() => setSelectedSize(variant.size)}
                  >
                    {variant.size}
                  </button>
                );
              })}
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
            ["SKU", activeVariant.sku],
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
