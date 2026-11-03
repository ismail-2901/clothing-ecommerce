"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, RotateCcw, Truck, Tag, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { formatMoney } from "@/lib/utils/money";
import { storePolicies } from "@/config/store";

type AppliedCoupon = { code: string; discountAmount: number; title: string };

const recommendations = [
  { id: "rec1", name: "Knit Sweater", price: 249000, image: "/elaris-women.jpg", slug: "knit-sweater" },
  { id: "rec2", name: "Basic Hoodie", price: 219000, originalPrice: 280000, discount: "21% OFF", image: "/elaris-men.jpg", slug: "basic-hoodie" },
  { id: "rec3", name: "Oversized Shirt", price: 189000, image: "/elaris-women.jpg", slug: "oversized-shirt" },
  { id: "rec4", name: "Classic Cap", price: 99000, image: "/elaris-accessories.jpg", slug: "classic-cap" },
];

export function CartPageContent() {
  const { items, summary, updateQuantity, removeItem } = useCart();
  const wishlist = useWishlist();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(() =>
    items.reduce((acc, item) => ({ ...acc, [item.id || item.sku]: true }), {})
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const toggleSelectAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    items.forEach((item) => {
      updated[item.id || item.sku] = checked;
    });
    setSelectedItems(updated);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cartSubtotal: summary.subtotal,
          shippingFee: summary.shippingFee
        })
      });
      const data = await res.json() as { valid?: boolean; error?: string; code?: string; title?: string; discountAmount?: number };
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? "Invalid coupon code.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.code!, discountAmount: data.discountAmount!, title: data.title! });
        setCouponCode("");
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  if (items.length === 0) {
    return (
      <div className="container-shell min-h-[65vh] py-20 text-center flex flex-col items-center justify-center">
        <div className="mx-auto max-w-md space-y-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Editorial Wardrobe
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore our curated seasonal capsule to discover pieces crafted with enduring elegance and tailored precision.
          </p>
          <div className="pt-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-none bg-foreground px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-all shadow-sm"
            >
              Discover Collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const freeThreshold = storePolicies.shipping.freeThreshold * 100;
  const freePct = Math.min(100, Math.round((summary.subtotal / freeThreshold) * 100));
  const remainingFree = freeThreshold - summary.subtotal;
  const isFreeDelivery = summary.subtotal >= freeThreshold;

  return (
    <div className="container-shell py-8 sm:py-12 space-y-10 sm:space-y-14">
      {/* Breadcrumb & Header */}
      <div className="space-y-3 border-b border-border/70 pb-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Shopping Bag</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Shopping Bag
            </h1>
            <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
              ({items.length} {items.length === 1 ? "piece" : "pieces"})
            </span>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Continue Browsing <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Free delivery progress banner */}
      <div className="rounded-xl border border-border/70 bg-stone-50/60 p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          {isFreeDelivery ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-900">
              <Sparkles size={14} className="text-amber-600 fill-amber-500/20" />
              Complimentary standard delivery unlocked
            </span>
          ) : (
            <span className="text-muted-foreground">
              Add <strong className="font-semibold text-foreground">{formatMoney(remainingFree)}</strong> more to receive complimentary delivery across Bangladesh
            </span>
          )}
          <span className="text-[11px] font-mono font-medium text-muted-foreground">
            {freePct}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-stone-200/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isFreeDelivery ? "bg-amber-600" : "bg-foreground"
            }`}
            style={{ width: `${freePct}%` }}
          />
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="grid gap-10 lg:grid-cols-[1.55fr_0.95fr] items-start">
        {/* Cart Items Table */}
        <div className="space-y-6">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-border/80 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Garment</span>
            <span className="text-center">Unit Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Line Total</span>
          </div>

          {/* Items Rows */}
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const itemKey = item.id || item.sku;
              const isChecked = selectedItems[itemKey] ?? true;
              const price = item.unitPrice ?? item.price;
              const lineTotal = price * item.quantity;

              return (
                <div key={itemKey} className="py-6 first:pt-2">
                  {/* Item Container */}
                  <div className="flex gap-4 sm:gap-5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setSelectedItems((prev) => ({ ...prev, [itemKey]: e.target.checked }))
                      }
                      aria-label={`Select ${item.name}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-border text-foreground accent-foreground cursor-pointer"
                    />

                    {/* Standardized 3:4 aspect ratio thumbnail */}
                    <div className="relative aspect-[3/4] w-24 sm:w-28 shrink-0 overflow-hidden rounded bg-stone-100 border border-border/70">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover object-top"
                          sizes="(min-width: 640px) 112px, 96px"
                        />
                      ) : (
                        <div className="h-full w-full bg-stone-100" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="space-y-1.5">
                        <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {item.color ? `Color: ${item.color}` : "Default"}
                          {item.size ? ` · Size: ${item.size}` : ""}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <span className="text-[11px] font-medium text-emerald-700">In Stock</span>
                        </div>
                      </div>

                      {/* Mobile-only price + stepper + total */}
                      <div className="sm:hidden pt-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Price</span>
                          <span className="text-xs font-semibold text-foreground">{formatMoney(price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="inline-flex h-8 items-center rounded border border-border bg-background shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-[28px] text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-foreground">{formatMoney(lineTotal)}</span>
                        </div>
                      </div>

                      {/* Item actions */}
                      <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => removeItem(itemKey)}
                          className="hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                        <span className="text-border">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            wishlist.addItem({
                              productId: item.productId || itemKey,
                              name: item.name,
                              price: price,
                              image: item.image,
                              slug: item.productSlug || ""
                            });
                            removeItem(itemKey);
                          }}
                          className="hover:text-foreground transition-colors"
                        >
                          Save for Later
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop-only: price / qty / total inline columns */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto] items-center gap-8 mt-4 pl-[calc(16px+112px+20px)]">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{formatMoney(price)}</p>
                    </div>
                    <div className="inline-flex h-8 items-center rounded border border-border bg-background shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[28px] text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold min-w-[88px] text-right text-foreground">
                      {formatMoney(lineTotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer Controls */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4 text-xs font-medium">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
              />
              <span className="text-muted-foreground">Select All ({items.length} items)</span>
            </label>
            <button
              type="button"
              onClick={() => items.forEach((i) => removeItem(i.id || i.sku))}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} /> Remove Selected
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
          <h2 className="font-serif text-xl font-semibold text-foreground tracking-tight">
            Order Summary
          </h2>

          {/* Breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
              <span className="font-medium text-foreground">{formatMoney(summary.subtotal)}</span>
            </div>
            {appliedCoupon && appliedCoupon.discountAmount > 0 && (
              <div className="flex justify-between text-amber-900 font-medium">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>- {formatMoney(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Delivery</span>
              <span className="font-medium text-foreground">
                {summary.shippingFee === 0 ? "Complimentary" : formatMoney(summary.shippingFee)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {storePolicies.shipping.freeDeliveryText}
            </p>
          </div>

          {/* Grand Total */}
          <div className="border-t border-border/80 pt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Estimated Total</span>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                {formatMoney(Math.max(0, summary.grandTotal - (appliedCoupon?.discountAmount ?? 0)))}
              </span>
            </div>
            {appliedCoupon && appliedCoupon.discountAmount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                <CheckCircle2 size={13} className="text-amber-700" />
                <span>You saved {formatMoney(appliedCoupon.discountAmount)} with {appliedCoupon.code}</span>
              </div>
            )}
          </div>

          {/* Coupon Input */}
          <div className="pt-1">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded border border-amber-300/80 bg-amber-50/60 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-amber-700" />
                  <span className="text-xs font-semibold text-amber-950">{appliedCoupon.code}</span>
                  <span className="text-xs text-amber-800">— {appliedCoupon.title}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  aria-label="Remove coupon"
                  className="text-amber-800 hover:text-red-600 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                      placeholder="Promotional code"
                      className="h-10 w-full rounded border border-border bg-stone-50/40 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-10 rounded-none bg-foreground px-5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors"
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] font-medium text-red-600">{couponError}</p>
                )}
              </form>
            )}
          </div>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-none bg-foreground text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-all shadow-sm active:scale-[0.99]"
          >
            Proceed to Checkout <ArrowRight size={14} />
          </Link>

          {/* Trust Value Props */}
          <div className="border-t border-border/80 pt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
            <div className="space-y-1.5">
              <Truck size={17} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Complimentary</p>
              <p>Over ৳5,000</p>
            </div>
            <div className="space-y-1.5">
              <RotateCcw size={17} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">7-Day Return</p>
              <p>Complimentary</p>
            </div>
            <div className="space-y-1.5">
              <ShieldCheck size={17} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Certified Safe</p>
              <p>Encrypted</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Curated Recommendations */}
      <section className="border-t border-border/80 pt-12 space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Curated Recommendations
          </h2>
          <Link
            href="/shop"
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            View All Pieces
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group block rounded border border-border/70 bg-background p-3 hover:shadow-md transition-all"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="text-xs font-medium text-foreground truncate group-hover:underline">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground">{formatMoney(item.price)}</span>
                  {item.originalPrice && (
                    <span className="text-muted-foreground line-through text-[11px]">
                      {formatMoney(item.originalPrice)}
                    </span>
                  )}
                  {item.discount && (
                    <span className="rounded bg-stone-900 px-1 text-[9px] font-bold text-white uppercase">
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
