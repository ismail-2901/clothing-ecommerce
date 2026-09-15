"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, RotateCcw, Truck, Tag, X } from "lucide-react";
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
      <div className="container-shell min-h-[60vh] py-16 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your Bag</p>
          <h1 className="text-3xl font-bold tracking-tight">Your Cart is Empty</h1>
          <p className="text-sm text-muted-foreground">
            Explore our new collection to discover pieces that reflect your personal style.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-8 space-y-12">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Cart</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Cart ({items.length})
          </h1>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground underline underline-offset-4"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr] items-start">
        {/* Cart Items Table */}
        <div className="space-y-6">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-border/80 pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          {/* Items Rows */}
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const itemKey = item.id || item.sku;
              const isChecked = selectedItems[itemKey] ?? true;
              const price = item.unitPrice ?? item.price;
              return (
                <div key={itemKey} className="py-5 grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setSelectedItems((prev) => ({ ...prev, [itemKey]: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-border text-foreground accent-foreground cursor-pointer"
                    />
                    <div className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="h-full w-full bg-zinc-100" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.color ? `Color: ${item.color}` : "Color: Default"} {item.size ? `| Size: ${item.size}` : ""}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium text-emerald-600">In Stock</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => removeItem(itemKey)}
                          className="hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                        <span>|</span>
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

                  {/* Price */}
                  <div className="text-center">
                    <p className="text-sm font-bold">{formatMoney(price)}</p>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatMoney(Math.round(price * 1.25))}
                    </p>
                    <span className="inline-block mt-1 rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                      20% OFF
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center rounded-md border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-extrabold">
                      {formatMoney(price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer Controls */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
              />
              <span>Select All ({items.length} items)</span>
            </label>
            <button
              type="button"
              onClick={() => items.forEach((i) => removeItem(i.id || i.sku))}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} /> Remove Selected
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>

          {/* Breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-semibold text-foreground">{formatMoney(summary.subtotal)}</span>
            </div>
            {appliedCoupon && appliedCoupon.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon ({appliedCoupon.code})</span>
                <span className="font-semibold">- {formatMoney(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-semibold text-foreground">
                {summary.shippingFee === 0 ? "Free" : formatMoney(summary.shippingFee)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {storePolicies.shipping.freeDeliveryText}
            </p>
          </div>

          {/* Total */}
          <div className="border-t border-border/80 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-extrabold">
                {formatMoney(Math.max(0, summary.grandTotal - (appliedCoupon?.discountAmount ?? 0)))}
              </span>
            </div>
            {appliedCoupon && appliedCoupon.discountAmount > 0 && (
              <p className="mt-1 text-xs text-emerald-600 font-semibold">
                🌱 You saved {formatMoney(appliedCoupon.discountAmount)} with {appliedCoupon.code}!
              </p>
            )}
          </div>

          {/* Coupon Input */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">{appliedCoupon.code}</span>
                <span className="text-xs text-emerald-600">— {appliedCoupon.title}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                aria-label="Remove coupon"
                className="text-emerald-500 hover:text-red-500 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                    placeholder="Enter coupon code"
                    className="h-10 w-full rounded-md border border-border bg-muted/20 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="h-10 rounded-md bg-foreground px-5 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                >
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-xs font-medium text-red-600">{couponError}</p>
              )}
            </form>
          )}

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors shadow-md"
          >
            Proceed to Checkout <ArrowRight size={15} />
          </Link>

          {/* Trust Value Props */}
          <div className="border-t border-border/80 pt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
            <div className="space-y-1">
              <Truck size={18} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Free Delivery</p>
              <p>{storePolicies.shipping.freeDeliveryText}</p>
            </div>
            <div className="space-y-1">
              <RotateCcw size={18} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Easy Returns</p>
              <p>{storePolicies.returns.description}</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck size={18} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Secure Payment</p>
              <p>100% secure checkout</p>
            </div>
          </div>
        </aside>
      </div>

      {/* You May Also Like Carousel */}
      <section className="border-t border-border/80 pt-10 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">You May Also Like</h2>
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
                  {item.originalPrice && (
                    <span className="text-muted-foreground line-through text-[11px]">
                      {formatMoney(item.originalPrice)}
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
