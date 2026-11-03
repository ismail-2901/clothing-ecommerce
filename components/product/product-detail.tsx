"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Ruler,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Feather,
  Gem,
  Shirt,
  Sparkles,
  X,
  Check
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import type { CatalogProduct, ProductReviewSummary } from "@/features/catalog/data";
import { ProductCard } from "@/components/product/product-card";
import { formatMoney } from "@/lib/utils/money";
import { storePolicies } from "@/config/store";

const colorHexMap: Record<string, string> = {
  black: "#1c1917",
  cream: "#f5f5f4",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
  olive: "#44403c",
  beige: "#e7e5e4",
  tan: "#d6d3d1",
  brown: "#57534e",
  charcoal: "#292524"
};

export function ProductDetail({
  product,
  reviewSummary,
  relatedProducts = []
}: {
  product: CatalogProduct;
  reviewSummary?: ProductReviewSummary;
  relatedProducts?: CatalogProduct[];
}) {
  const { addItem } = useCart();
  const { toggleItem, isSaved } = useWishlist();

  // Normalize product images
  const galleryImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [
      { src: "/elaris-women.jpg", alt: product.name },
      { src: "/elaris-hero.jpg", alt: product.name },
      { src: "/elaris-men.jpg", alt: product.name },
      { src: "/elaris-accessories.jpg", alt: product.name }
    ];
  }, [product.images, product.name]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "size" | "material" | "shipping" | "reviews"
  >("description");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<"in" | "cm">("in");
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (showSizeGuide || isLightboxOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowSizeGuide(false);
          setIsLightboxOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showSizeGuide, isLightboxOpen]);

  const [imgZoom, setImgZoom] = useState<{ x: number; y: number } | null>(null);
  const mainImgRef = useRef<HTMLDivElement>(null);

  const handleMainImgMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mainImgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImgZoom({ x, y });
  }, []);

  const handleMainImgMouseLeave = useCallback(() => setImgZoom(null), []);

  // Colors & Sizes
  const colors = useMemo(() => {
    const list = [...new Set(product.variants.map((v) => (v.color || "Cream").toLowerCase()))];
    return list.length > 0 ? list : ["cream", "black", "gray", "olive"];
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);

  const sizes = useMemo(() => {
    const list = [...new Set(product.variants.map((v) => v.size))].filter(Boolean);
    return list.length > 0 ? list : ["XS", "S", "M", "L", "XL"];
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string>(sizes[1] || sizes[0] || "M");

  const activeVariant = useMemo(() => {
    return (
      product.variants.find(
        (v) =>
          v.color.toLowerCase() === selectedColor.toLowerCase() &&
          v.size.toLowerCase() === selectedSize.toLowerCase()
      ) ?? product.variants[0]
    );
  }, [product.variants, selectedColor, selectedSize]);

  const price = activeVariant?.price ?? 0;
  const comparePrice = activeVariant?.compareAtPrice;
  const discountPct =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  const isSale = Boolean(discountPct && discountPct > 0);

  const handleAddToCart = () => {
    addItem({
      sku: activeVariant?.sku || `${product.id}_${selectedColor}_${selectedSize}`,
      variantId: activeVariant?.id,
      productId: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      price,
      quantity,
      image: galleryImages[activeImageIndex]?.src ?? galleryImages[0]?.src ?? "/elaris-women.jpg"
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      image: galleryImages[0]?.src ?? "/elaris-women.jpg"
    });
  };

  const isProductSaved = isSaved(product.id);
  const [copied, setCopied] = useState(false);

  return (
    <div className="container-shell py-8 pb-28 space-y-16 lg:pb-12">
      {/* Toast Notification when product is added to bag */}
      {addedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center gap-2.5 rounded-xl border border-border bg-stone-900 text-stone-100 px-4 py-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check size={16} className="text-emerald-400" />
          <span>Added to your shopping bag</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${(product.category || "women").toLowerCase()}`}
          className="hover:text-foreground capitalize transition-colors"
        >
          {product.category || "Women"}
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* PDP Main Showcase: Left Image Gallery | Right Product Buy Box */}
      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.3fr_1fr] items-start">
        {/* Left: Editorial Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Vertical Thumbnail Rail (Horizontal on Mobile) */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-none sm:max-h-[640px] pb-1 sm:pb-0 scrollbar-none">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative h-18 w-14 sm:h-24 sm:w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  idx === activeImageIndex
                    ? "border-foreground shadow-sm"
                    : "border-border/70 opacity-70 hover:opacity-100"
                }`}
                style={{ aspectRatio: "3 / 4" }}
              >
                <Image
                  src={img.src}
                  alt={img.alt || product.name}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 640px) 80px, 60px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Main Large Showcase Box with 3:4 Aspect Ratio */}
          <div
            ref={mainImgRef}
            className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl bg-muted/40 border border-border/80 group cursor-crosshair shadow-sm"
            onMouseMove={handleMainImgMouseMove}
            onMouseLeave={handleMainImgMouseLeave}
          >
            <Image
              src={galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"}
              alt={product.name}
              fill
              priority
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 100vw"
            />

            {/* Magnifier Hover Lens for Desktop */}
            {imgZoom && (
              <div
                className="pointer-events-none hidden sm:block absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden"
                style={{
                  width: 190,
                  height: 190,
                  left: `calc(${imgZoom.x}% - 95px)`,
                  top: `calc(${imgZoom.y}% - 95px)`,
                  backgroundImage: `url(${galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"})`,
                  backgroundSize: "400% 400%",
                  backgroundPosition: `${imgZoom.x}% ${imgZoom.y}%`,
                  backgroundRepeat: "no-repeat",
                  zIndex: 30,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.7)"
                }}
              />
            )}

            {/* Expand Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur-md text-foreground shadow-subtle hover:bg-background transition-colors"
              aria-label="Expand image view"
            >
              <Maximize2 size={16} />
            </button>

            {/* Image Switcher Controls */}
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur-md text-foreground shadow-subtle hover:bg-background transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur-md text-foreground shadow-subtle hover:bg-background transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={17} />
            </button>

            {/* Image Counter Indicator */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {activeImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>

        {/* Right: Buy Box & Editorial Information */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3">
            {/* Badges & Wishlist Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-stone-900 text-stone-100 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                  Capsule Drop
                </span>
                {isSale && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
                    {discountPct}% Off
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-xs"
                aria-label={isProductSaved ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart
                  size={18}
                  className={isProductSaved ? "fill-rose-500 text-rose-500" : "text-foreground"}
                />
              </button>
            </div>

            {/* Product Title in Editorial Serif */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-[1.1]">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-2 text-xs">
              {reviewSummary && reviewSummary.totalCount > 0 ? (
                <>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= Math.round(reviewSummary.averageRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold text-foreground">
                    {reviewSummary.averageRating.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                  >
                    ({reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? "review" : "reviews"})
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex items-center text-muted-foreground/30">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} />
                    ))}
                  </div>
                  <span>No reviews yet</span>
                </button>
              )}
            </div>

            {/* Price Presentation */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {formatMoney(price)}
              </span>
              {comparePrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatMoney(comparePrice)}
                </span>
              )}
            </div>

            {/* Product Short Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
              {product.description ||
                "Engineered with architectural precision and breathable luxury textiles. Built for effortless transition from day to evening."}
            </p>
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5 border-t border-border/80 pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-foreground">
                Color: <span className="font-normal capitalize text-muted-foreground">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => {
                const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`relative h-8 w-8 rounded-full border transition-all ${
                      isSelected
                        ? "ring-2 ring-foreground ring-offset-2 scale-105"
                        : "border-black/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: colorHexMap[c] || "#1c1917" }}
                    title={c}
                    aria-label={`Select color ${c}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5 border-t border-border/80 pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-foreground">
                Size: <span className="font-normal text-muted-foreground">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="flex items-center gap-1 font-semibold text-foreground underline underline-offset-4 hover:text-stone-600 transition-colors"
              >
                <Ruler size={14} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize.toLowerCase() === s.toLowerCase();
                const sizeVariant =
                  product.variants.find(
                    (v) =>
                      v.size.toLowerCase() === s.toLowerCase() &&
                      v.color.toLowerCase() === selectedColor.toLowerCase()
                  ) ?? product.variants.find((v) => v.size.toLowerCase() === s.toLowerCase());
                const stock = (sizeVariant as { stock?: number })?.stock ?? null;
                const outOfStock = stock !== null && stock === 0;

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(s)}
                    title={outOfStock ? "Out of stock" : undefined}
                    className={`relative flex h-11 min-w-[50px] items-center justify-center rounded-lg border text-xs font-bold uppercase transition-all ${
                      outOfStock
                        ? "border-border/40 bg-muted/40 text-muted-foreground/40 line-through cursor-not-allowed"
                        : isSelected
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border bg-background text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Low Stock Warning */}
            {(() => {
              const selVariant =
                product.variants.find(
                  (v) =>
                    v.size.toLowerCase() === selectedSize.toLowerCase() &&
                    v.color.toLowerCase() === selectedColor.toLowerCase()
                ) ?? product.variants.find((v) => v.size.toLowerCase() === selectedSize.toLowerCase());
              const stock = (selVariant as { stock?: number })?.stock ?? null;
              if (stock !== null && stock > 0 && stock <= 5) {
                return (
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 pt-1">
                    <Sparkles size={12} className="text-amber-600" />
                    <span>Only {stock} items left in this size · Order soon</span>
                  </p>
                );
              }
              return null;
            })()}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3.5 border-t border-border/80 pt-5">
            <div className="flex items-center gap-3">
              {/* Stepper with minimum 44px touch targets */}
              <div className="inline-flex h-12 items-center rounded-lg border border-border bg-background shadow-xs">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-9 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Primary Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-bold uppercase tracking-[0.14em] text-background hover:bg-stone-800 transition-all shadow-md active:scale-[0.99]"
              >
                <ShoppingBag size={15} /> Add to Bag
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <Link
              href="/checkout"
              onClick={handleAddToCart}
              className="flex h-12 w-full items-center justify-center rounded-lg border border-foreground bg-background text-xs font-bold uppercase tracking-[0.14em] text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              Express Checkout
            </Link>

            {/* Secondary Action Links */}
            <div className="flex items-center justify-center gap-6 pt-1 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Heart size={14} className={isProductSaved ? "fill-rose-500 text-rose-500" : ""} />
                {isProductSaved ? "Saved in Wishlist" : "Save to Wishlist"}
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Share2 size={14} /> {copied ? "Link Copied!" : "Share Piece"}
              </button>
            </div>
          </div>

          {/* Luxury Service Trust Indicators */}
          <div className="border-t border-border/80 pt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-stone-50/60 dark:bg-stone-900/40 p-3.5">
              <Truck size={17} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Complimentary Delivery</p>
                <p className="text-[11px] text-muted-foreground">{storePolicies.shipping.freeDeliveryText}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-stone-50/60 dark:bg-stone-900/40 p-3.5">
              <RotateCcw size={17} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">7-Day Free Exchange</p>
                <p className="text-[11px] text-muted-foreground">{storePolicies.returns.description}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-stone-50/60 dark:bg-stone-900/40 p-3.5">
              <ShieldCheck size={17} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Secure Payment</p>
                <p className="text-[11px] text-muted-foreground">COD &amp; Encrypted Wallets</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-stone-50/60 dark:bg-stone-900/40 p-3.5">
              <Headphones size={17} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Client Care</p>
                <p className="text-[11px] text-muted-foreground">Dedicated fashion advisory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add-to-Bag Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center gap-3 border-t border-border bg-background/95 backdrop-blur-md px-4 shadow-luxury lg:hidden">
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-[11px] font-medium text-muted-foreground truncate">{product.name}</span>
          <span className="text-base font-black text-foreground">{formatMoney(price)}</span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex h-11 px-5 items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-stone-800 transition-colors shadow-sm shrink-0"
        >
          <ShoppingBag size={14} /> Add to Bag
        </button>
      </div>

      {/* Tabbed Product Details Section */}
      <section className="border-t border-border/80 pt-10 space-y-6">
        <div className="flex flex-wrap border-b border-border/80 gap-6 sm:gap-8 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3 transition-colors ${
              activeTab === "description"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Design &amp; Silhouette
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("size")}
            className={`pb-3 transition-colors ${
              activeTab === "size"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Size &amp; Fit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("material")}
            className={`pb-3 transition-colors ${
              activeTab === "material"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Textile &amp; Care
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 transition-colors ${
              activeTab === "shipping"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dispatch &amp; Returns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 transition-colors ${
              activeTab === "reviews"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Client Reviews ({reviewSummary?.totalCount ?? 0})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-3xl space-y-4">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p>
                {product.description ||
                  `Woven from carefully selected premium cotton blends, this ${product.name.toLowerCase()} offers an effortless drape with understated architectural lines. Crafted for timeless wear across all seasons.`}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/85">
                <li>Artisanal tailoring with reinforced stress points</li>
                <li>Breathable shape-retaining organic fibers</li>
                <li>Minimalist hardware and clean profile</li>
                <li>Preshrunk textile preventing shrinkage</li>
                <li>Ethically produced under fair atelier standards</li>
              </ul>
            </div>
          )}

          {activeTab === "size" && (
            <div className="space-y-3">
              <p>
                Model is 5&apos;9&quot; wearing size Medium. Tailored to an effortless modern silhouette. For a more relaxed drape, select your standard size. For a fitted contour, we recommend ordering one size down.
              </p>
              <p className="text-xs">
                Need specific guidance? Open the{" "}
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="font-bold text-foreground underline underline-offset-2"
                >
                  Size &amp; Fit Guide
                </button>{" "}
                for exact garment measurements in inches and centimeters.
              </p>
            </div>
          )}

          {activeTab === "material" && (
            <div className="space-y-3">
              <p>
                80% Combed Long-Staple Organic Cotton, 20% Technical Recycled Fleece. Hand-finished for exceptional handfeel and longevity.
              </p>
              <p>
                Care Instructions: Machine wash cold on delicate cycle with matching colors. Turn garment inside out before washing. Do not bleach. Hang dry in shaded breeze or tumble dry low. Low iron if desired.
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3">
              <p>
                Orders confirmed before {storePolicies.shipping.dispatchCutoff} dispatch same day from our Dhaka fulfillment center. Standard delivery takes {storePolicies.shipping.dhakaDays} within Dhaka metropolitan and {storePolicies.shipping.outsideDhakaDays} across all other divisions.
              </p>
              <p>
                We provide a 7-day complimentary return or size exchange guarantee on all unworn garments with original tags intact.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviewSummary && reviewSummary.totalCount > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-stone-50/60 dark:bg-stone-900/40 p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-foreground">
                        {reviewSummary.averageRating.toFixed(1)}
                      </span>
                      <div>
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={15}
                              className={
                                star <= Math.round(reviewSummary.averageRating)
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Based on {reviewSummary.totalCount}{" "}
                          {reviewSummary.totalCount === 1 ? "verified review" : "verified reviews"}
                        </span>
                      </div>
                    </div>
                    {reviewSummary.verifiedCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        <ShieldCheck size={16} />
                        <span>
                          {reviewSummary.verifiedCount} verified{" "}
                          {reviewSummary.verifiedCount === 1 ? "purchase" : "purchases"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-border/60">
                    {reviewSummary.reviews.map((rev) => (
                      <div key={rev.id} className="py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {rev.authorName}
                            </span>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <ShieldCheck size={12} />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <time className="text-xs text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </time>
                        </div>

                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= rev.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>

                        {rev.title && (
                          <h4 className="font-semibold text-foreground text-sm">{rev.title}</h4>
                        )}

                        {rev.body && (
                          <p className="text-muted-foreground text-xs leading-relaxed">{rev.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-2">
                  <div className="flex justify-center text-muted-foreground/30">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} />
                    ))}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">No reviews yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    There are no reviews for this piece yet. Verified buyers will be able to share their thoughts here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Atelier Quality Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-stone-50/50 dark:bg-stone-900/30 p-4 text-center space-y-2">
            <Feather size={20} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Soft &amp; Breathable Fabric</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-stone-50/50 dark:bg-stone-900/30 p-4 text-center space-y-2">
            <Gem size={20} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Artisanal Quality</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-stone-50/50 dark:bg-stone-900/30 p-4 text-center space-y-2">
            <Shirt size={20} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Capsule Essential</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-stone-50/50 dark:bg-stone-900/30 p-4 text-center space-y-2">
            <Sparkles size={20} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Enduring Aesthetic</p>
          </div>
        </div>
      </section>

      {/* Complete the Look / You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border/80 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Complete the Look
            </h2>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore Collection →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSizeGuide(false)}
          />

          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-foreground" />
                <h3 className="font-serif text-lg font-bold text-foreground">Size &amp; Fit Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close size guide"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                All measurements refer to garment dimensions.
              </p>
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSizeGuideUnit("in")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sizeGuideUnit === "in"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setSizeGuideUnit("cm")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    sizeGuideUnit === "cm"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 font-bold uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-3 py-2.5">Size</th>
                    <th className="px-3 py-2.5">Chest</th>
                    <th className="px-3 py-2.5">Waist</th>
                    <th className="px-3 py-2.5">Hip</th>
                    <th className="px-3 py-2.5">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {[
                    { size: "XS", chestIn: "34-36", chestCm: "86-91", waistIn: "28-30", waistCm: "71-76", hipIn: "34-36", hipCm: "86-91", lenIn: "27", lenCm: "68" },
                    { size: "S", chestIn: "36-38", chestCm: "91-96", waistIn: "30-32", waistCm: "76-81", hipIn: "36-38", hipCm: "91-96", lenIn: "28", lenCm: "71" },
                    { size: "M", chestIn: "38-40", chestCm: "96-101", waistIn: "32-34", waistCm: "81-86", hipIn: "38-40", hipCm: "96-101", lenIn: "29", lenCm: "74" },
                    { size: "L", chestIn: "40-42", chestCm: "101-106", waistIn: "34-36", waistCm: "86-91", hipIn: "40-42", hipCm: "101-106", lenIn: "30", lenCm: "76" },
                    { size: "XL", chestIn: "42-44", chestCm: "106-111", waistIn: "36-38", waistCm: "91-96", hipIn: "42-44", hipCm: "106-111", lenIn: "31", lenCm: "79" },
                    { size: "XXL", chestIn: "44-46", chestCm: "111-116", waistIn: "38-40", waistCm: "96-101", hipIn: "44-46", hipCm: "111-116", lenIn: "32", lenCm: "81" }
                  ].map((row) => (
                    <tr
                      key={row.size}
                      className={
                        selectedSize.toUpperCase() === row.size
                          ? "bg-muted/40 font-bold"
                          : "hover:bg-muted/20"
                      }
                    >
                      <td className="px-3 py-2.5 font-bold">{row.size}</td>
                      <td className="px-3 py-2.5">{sizeGuideUnit === "in" ? row.chestIn : row.chestCm}</td>
                      <td className="px-3 py-2.5">{sizeGuideUnit === "in" ? row.waistIn : row.waistCm}</td>
                      <td className="px-3 py-2.5">{sizeGuideUnit === "in" ? row.hipIn : row.hipCm}</td>
                      <td className="px-3 py-2.5">{sizeGuideUnit === "in" ? row.lenIn : row.lenCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-stone-50/70 dark:bg-stone-900/40 p-4 text-[11px] leading-relaxed text-muted-foreground space-y-1 border border-border/70">
              <p className="font-bold text-foreground">How to Measure:</p>
              <p>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</p>
              <p>• <strong>Waist:</strong> Measure around the narrowest part of your natural waistline.</p>
              <p>• <strong>Hips:</strong> Measure around the fullest part of your hips with feet together.</p>
            </div>
          </div>
        </div>
      )}

      {/* High-Res Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Zoom View"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in-0 duration-200"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Close zoom view"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>

          <div className="relative h-[85vh] w-[85vw] max-w-4xl max-h-[900px]">
            <Image
              src={galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"}
              alt={product.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold text-white">
            {activeImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
