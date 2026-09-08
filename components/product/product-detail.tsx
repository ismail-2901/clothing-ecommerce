"use client";

import { useMemo, useState } from "react";
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
  Sparkles
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import type { CatalogProduct, CatalogVariant } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";

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

const recommendations = [
  { id: "r1", name: "Basic Hoodie", price: 2190, original: 2800, discount: "21% OFF", image: "/elaris-men.jpg", slug: "basic-hoodie" },
  { id: "r2", name: "Essential Sweatshirt", price: 1990, original: 2500, discount: "20% OFF", image: "/elaris-women.jpg", slug: "essential-sweatshirt" },
  { id: "r3", name: "Oversized T-Shirt", price: 1690, original: 2200, discount: "23% OFF", image: "/elaris-men.jpg", slug: "oversized-t-shirt" },
  { id: "r4", name: "Zip Hoodie", price: 2890, original: 3500, discount: "17% OFF", image: "/elaris-women.jpg", slug: "zip-hoodie" },
];

export function ProductDetail({ product }: { product: CatalogProduct }) {
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

  const rawPrice = activeVariant?.price ?? 249000;
  const price = rawPrice > 0 && rawPrice < 10000 ? rawPrice * 100 : rawPrice;
  const rawComparePrice = activeVariant?.compareAtPrice ?? 320000;
  const comparePrice = rawComparePrice > 0 && rawComparePrice < 10000 ? rawComparePrice * 100 : rawComparePrice;
  const discountPct = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 22;

  const handleAddToCart = () => {
    addItem({
      sku: activeVariant?.sku || `${product.id}_${selectedColor}_${selectedSize}`,
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

  return (
    <div className="container-shell py-8 space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/shop?category=women" className="hover:text-foreground">Women</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">{product.category || "Tops"}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* PDP Main Showcase (Left: Vertical Thumbnails + Main Image | Right: Product Buy Box) */}
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left: Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Vertical Thumbnail Column */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[560px] pb-2 sm:pb-0 scrollbar-none">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  idx === activeImageIndex
                    ? "border-foreground shadow-sm"
                    : "border-border/70 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt || product.name} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>

          {/* Main Large Image Box */}
          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-2xl bg-muted border border-border/80 group">
            <Image
              src={galleryImages[activeImageIndex]?.src || "/elaris-women.jpg"}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />

            {/* Expand button */}
            <button
              type="button"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* Image counter indicator */}
            <div className="absolute bottom-4 left-4 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              {activeImageIndex + 1}/{galleryImages.length}
            </div>
          </div>
        </div>

        {/* Right: Buy Box & Product Info */}
        <div className="space-y-6">
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
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-foreground">4.8</span>
              <span className="text-muted-foreground">(124 reviews)</span>
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
              {discountPct > 0 && (
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
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`flex h-10 min-w-12 items-center justify-center rounded-md border text-xs font-bold uppercase transition-all ${
                      isSelected
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border bg-background text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
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
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Share2 size={14} /> Share Product
              </button>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="border-t border-border/80 pt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <Truck size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Free Delivery</p>
                <p className="text-[11px] text-muted-foreground">On orders over ৳3000</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <RotateCcw size={18} className="text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Easy Returns</p>
                <p className="text-[11px] text-muted-foreground">7 days return policy</p>
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
            Reviews (362)
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-3xl space-y-4">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p>
                Made from high-quality cotton blend fabric, this {product.name.toLowerCase()} offers a relaxed fit with a minimalist design. Perfect for casual wear, layering, or everyday comfort.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>Premium cotton blend</li>
                <li>Relaxed oversized fit</li>
                <li>Soft and breathable fabric</li>
                <li>Minimal ELARIS logo embroidery</li>
                <li>Kangaroo pocket &amp; drawstring hood</li>
                <li>Ribbed cuffs and hem</li>
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
              Orders placed before 2 PM are dispatched the same business day. Delivery across Bangladesh takes 2–4 business days. Returns and size exchanges are accepted within 7 days of delivery.
            </p>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">4.8 out of 5</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
              </div>
              <p>Over 98% of customers recommend this item for comfort and fit.</p>
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

      {/* You May Also Like Section */}
      <section className="border-t border-border/80 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">You May Also Like</h2>
          <Link href="/shop" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group block rounded-lg border border-border/80 bg-background p-3 hover:shadow-md transition-all"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-xs font-bold text-foreground truncate">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold">{formatMoney(item.price)}</span>
                  {item.original && (
                    <span className="text-muted-foreground line-through text-[11px]">
                      {formatMoney(item.original)}
                    </span>
                  )}
                  {item.discount && (
                    <span className="rounded bg-black px-1 text-[9px] font-bold text-white">
                      {item.discount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
