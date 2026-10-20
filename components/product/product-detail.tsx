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


const SIZE_SORT_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

const colorHexMap: Record<string, string> = {
  black: "#111111",
  cream: "#F4EFEA",
  white: "#FFFFFF",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  olive: "#556B2F",
  beige: "#D8C7B5",
  tan: "#C2A68C",
  brown: "#4B3621",
  charcoal: "#2F3E46"
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
  const [activeTab, setActiveTab] = useState<"description" | "size" | "material" | "shipping" | "reviews">("description");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<"in" | "cm">("in");

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
  const discountPct = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;

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
      image: galleryImages[activeImageIndex]?.src ?? galleryImages[0]?.src ?? "/elaris-women.jpg",
    });
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
    <div className="container-shell py-8 pb-24 space-y-14 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${(product.category || "women").toLowerCase()}`} className="hover:text-foreground" style={{textTransform: "capitalize"}}>{product.category || "Women"}</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">{product.category || "Tops"}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* PDP Main Showcase (Left: Vertical Thumbnails + Main Image | Right: Product Buy Box) */}
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left: Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnail Rail: Horizontal at bottom on mobile, vertical column on left on sm+ */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-none sm:max-h-[560px] pb-1 sm:pb-0 scrollbar-none">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Select image ${idx + 1}`}
                className={`relative h-16 w-14 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  idx === activeImageIndex
                    ? "border-foreground shadow-sm"
                    : "border-border/70 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt || product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 80px, 56px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Unified Main Product Showcase Box (Single responsive element for all viewports) */}
          <div
            ref={mainImgRef}
            className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl bg-muted border border-border/80 group cursor-crosshair"
            onMouseMove={handleMainImgMouseMove}
            onMouseLeave={handleMainImgMouseLeave}
          >
            <Image
              src={galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 100vw"
            />

            {/* PC Hover Zoom Lens */}
            {imgZoom && (
              <div
                className="pointer-events-none hidden sm:block absolute rounded-full border-2 border-white/80 shadow-2xl overflow-hidden"
                style={{
                  width: 180,
                  height: 180,
                  left: `calc(${imgZoom.x}% - 90px)`,
                  top: `calc(${imgZoom.y}% - 90px)`,
                  backgroundImage: `url(${galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"})`,
                  backgroundSize: "400% 400%",
                  backgroundPosition: `${imgZoom.x}% ${imgZoom.y}%`,
                  backgroundRepeat: "no-repeat",
                  zIndex: 30,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.6)",
                }}
              />
            )}

            {/* Expand / Lightbox button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
              aria-label="Expand image"
            >
              <Maximize2 size={16} />
            </button>

            {/* Prev / Next carousel controls */}
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
              }
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* Image counter indicator */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-md bg-black/70 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-sm">
              {activeImageIndex + 1}/{galleryImages.length}
            </div>
          </div>
        </div>

        {/* Right: Buy Box & Product Info — sticky on desktop */}
        <div className="space-y-6 pb-24 lg:pb-0 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Best Seller
              </span>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors"
                aria-label="Save to wishlist"
              >
                <Heart size={18} className={isProductSaved ? "fill-rose-500 text-rose-500" : "text-foreground"} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 text-xs">
              {reviewSummary && reviewSummary.totalCount > 0 ? (
                <>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= Math.round(reviewSummary.averageRating)
                            ? "fill-amber-400 text-amber-400"
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

            {/* Price */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {formatMoney(price)}
              </span>
              {comparePrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatMoney(comparePrice)}
                </span>
              )}
              {discountPct !== null && discountPct > 0 && (
                <span className="rounded bg-black px-2 py-0.5 text-xs font-bold text-white uppercase">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            <p className="pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.description ||
                "A perfect blend of comfort and style. Made with premium cotton fleece, it offers the perfect blend of comfort, warmth and modern street style."}
            </p>
          </div>

          {/* Color Selector */}
          <div className="space-y-2 border-t border-border/80 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground capitalize">
                Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {colors.map((c) => {
                const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`relative h-7 w-7 rounded-full border transition-all ${
                      isSelected
                        ? "ring-2 ring-foreground ring-offset-2 scale-110"
                        : "border-black/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: colorHexMap[c] || "#111111" }}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2 border-t border-border/80 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground uppercase">
                Size: <span className="font-normal text-muted-foreground">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="flex items-center gap-1 font-semibold text-foreground underline underline-offset-4"
              >
                <Ruler size={14} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize.toLowerCase() === s.toLowerCase();
                // Find the variant matching this size + selected colour to get stock
                const sizeVariant = product.variants.find(
                  (v) => v.size.toLowerCase() === s.toLowerCase() &&
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
                    className={`relative flex h-10 min-w-12 items-center justify-center rounded-md border text-xs font-bold uppercase transition-all ${
                      outOfStock
                        ? "border-border/40 bg-muted/40 text-muted-foreground/50 line-through cursor-not-allowed"
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
            {/* Low stock warning for selected size */}
            {(() => {
              const selVariant = product.variants.find(
                (v) => v.size.toLowerCase() === selectedSize.toLowerCase() &&
                       v.color.toLowerCase() === selectedColor.toLowerCase()
              ) ?? product.variants.find((v) => v.size.toLowerCase() === selectedSize.toLowerCase());
              const stock = (selVariant as { stock?: number })?.stock ?? null;
              if (stock !== null && stock > 0 && stock <= 5) {
                return (
                  <p className="text-xs font-semibold text-amber-600">
                    Only {stock} left in this size
                  </p>
                );
              }
              return null;
            })()}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 border-t border-border/80 pt-5">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="inline-flex h-11 items-center rounded-md border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Primary Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors shadow-md"
              >
                <ShoppingBag size={15} /> Add to Cart
              </button>
            </div>

            {/* Buy Now Secondary Button */}
            <Link
              href="/checkout"
              onClick={handleAddToCart}
              className="flex h-11 w-full items-center justify-center rounded-md border border-foreground bg-background text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-colors"
            >
              Buy Now
            </Link>

            {/* Secondary Action Links */}
            <div className="flex items-center justify-center gap-6 pt-1 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Heart size={14} className={isProductSaved ? "fill-rose-500 text-rose-500" : ""} />
                {isProductSaved ? "Saved in Wishlist" : "Add to Wishlist"}
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
                <Share2 size={14} /> {copied ? "Copied!" : "Share Product"}
              </button>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="border-t border-border/80 pt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <Truck size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Free Delivery</p>
                <p className="text-[11px] text-muted-foreground">{storePolicies.shipping.freeDeliveryText}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <RotateCcw size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Easy Returns</p>
                <p className="text-[11px] text-muted-foreground">{storePolicies.returns.description}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <ShieldCheck size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Secure Payment</p>
                <p className="text-[11px] text-muted-foreground">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <Headphones size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">24/7 Support</p>
                <p className="text-[11px] text-muted-foreground">We&apos;re always here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* C1: Sticky mobile Add-to-Bag bar — hidden on lg+ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center gap-3 border-t border-border bg-background px-4 shadow-lg lg:hidden">
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] text-muted-foreground">{product.name.length > 18 ? product.name.slice(0, 18) + "…" : product.name}</span>
          <span className="text-base font-black">{formatMoney(price)}</span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
        >
          <ShoppingBag size={15} /> Add to Bag
        </button>
      </div>

      {/* Tabbed Product Details Section */}
      <section className="border-t border-border/80 pt-8 space-y-6">
        <div className="flex flex-wrap border-b border-border/80 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3 transition-colors ${
              activeTab === "description"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Description
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
            Material &amp; Care
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
            Shipping &amp; Returns
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
            Reviews ({reviewSummary?.totalCount ?? 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-3xl space-y-4">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p>
                {product.description ||
                  `Made from high-quality cotton blend fabric, this ${product.name.toLowerCase()} offers a relaxed fit with a minimalist design. Perfect for casual wear, layering, or everyday comfort.`}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>Premium tailored construction</li>
                <li>Designed for versatile daily wear</li>
                <li>Breathable, shape-retaining weave</li>
                <li>Subtle ELARIS signature detailing</li>
                <li>Preshrunk fabric with reinforced seams</li>
              </ul>
            </div>
          )}

          {activeTab === "size" && (
            <p>
              Model is 5&apos;8&quot; wearing size M. Fits true to size with an intended relaxed, oversized silhouette. If you prefer a tailored fit, we recommend ordering one size down.
            </p>
          )}

          {activeTab === "material" && (
            <p>
              80% Organic Combed Cotton, 20% Recycled Polyester. Machine wash cold with similar colors. Do not bleach. Tumble dry low or hang dry in shade. Warm iron if needed.
            </p>
          )}

          {activeTab === "shipping" && (
            <p>
              Orders placed before {storePolicies.shipping.dispatchCutoff} are dispatched the same business day. Delivery takes {storePolicies.shipping.dhakaDays} within Dhaka and {storePolicies.shipping.outsideDhakaDays} outside Dhaka. Returns and size exchanges are accepted within {storePolicies.returns.days} days of delivery.
            </p>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviewSummary && reviewSummary.totalCount > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 p-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-foreground">
                          {reviewSummary.averageRating.toFixed(1)}
                        </span>
                        <div>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={15}
                                className={
                                  star <= Math.round(reviewSummary.averageRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Based on {reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {reviewSummary.verifiedCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck size={16} />
                        <span>{reviewSummary.verifiedCount} verified {reviewSummary.verifiedCount === 1 ? "purchase" : "purchases"}</span>
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

                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }
                            />
                          ))}
                        </div>

                        {rev.title && (
                          <h4 className="font-medium text-foreground text-sm">
                            {rev.title}
                          </h4>
                        )}

                        {rev.body && (
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {rev.body}
                          </p>
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
                    There are no reviews for this product yet. Verified buyers will be able to share their thoughts here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-2">
            <Feather size={22} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Soft &amp; Breathable Fabric</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-2">
            <Gem size={22} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Premium Quality</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-2">
            <Shirt size={22} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Everyday Essential</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-2">
            <Sparkles size={22} className="text-foreground" />
            <p className="text-xs font-bold text-foreground">Timeless Design</p>
          </div>
        </div>
      </section>

      {/* Complete the Look / You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border/80 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Complete the Look</h2>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              View All →
            </Link>
          </div>
          {/* Horizontally scrollable on mobile, grid on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSizeGuide(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-foreground" />
                <h3 className="text-base font-bold text-foreground">Size &amp; Fit Guide</h3>
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

            {/* Unit Switcher */}
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

            {/* Measurement Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
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
                    { size: "XXL", chestIn: "44-46", chestCm: "111-116", waistIn: "38-40", waistCm: "96-101", hipIn: "44-46", hipCm: "111-116", lenIn: "32", lenCm: "81" },
                  ].map((row) => (
                    <tr
                      key={row.size}
                      className={selectedSize.toUpperCase() === row.size ? "bg-muted/40 font-bold" : "hover:bg-muted/20"}
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

            {/* How to Measure Tip */}
            <div className="rounded-xl bg-muted/40 p-4 text-[11px] leading-relaxed text-muted-foreground space-y-1 border border-border/60">
              <p className="font-bold text-foreground">How to Measure:</p>
              <p>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</p>
              <p>• <strong>Waist:</strong> Measure around the narrowest part of your natural waistline.</p>
              <p>• <strong>Hips:</strong> Measure around the fullest part of your hips with feet together.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── High-Res Image Lightbox Modal ── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Zoom View"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
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
            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={() => setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
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
