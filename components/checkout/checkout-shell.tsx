"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, RotateCcw, Truck, Headphones, Tag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/utils/money";

export function CheckoutShell() {
  const router = useRouter();
  const { items, summary, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "Md. Ismail Hossain",
    email: "ismailhossain@email.com",
    phone: "1712345678",
    saveInfo: true,
    address: "House 12, Road 5, Block C",
    city: "Dhaka",
    division: "Dhaka",
    postalCode: "1216",
    country: "Bangladesh",
    sameBilling: true,
    paymentMethod: "COD"
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: `+880${formData.phone}`,
          deliveryName: formData.fullName,
          deliveryLine1: formData.address,
          deliveryCity: formData.city,
          deliveryCountry: "BD",
          paymentProvider: formData.paymentMethod,
          cartItems: items.map((item) => ({
            sku: item.sku,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Checkout failed.");
        setLoading(false);
        return;
      }

      const generatedId = result.orderId || `ELR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-1842`;
      clearCart();
      router.push(`/checkout/success?orderId=${generatedId}&name=${encodeURIComponent(formData.fullName)}&total=${summary.grandTotal}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Checkout</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Complete Your Order
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Just a few steps away from your new favorite pieces.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock size={16} className="text-foreground" />
          <div>
            <p className="font-bold text-foreground">Secure Checkout</p>
            <p className="text-[11px]">Your information is safe with us.</p>
          </div>
        </div>
      </div>

      {/* 4-Step Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            1
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Contact</p>
            <p className="text-[11px] text-muted-foreground">Your details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 2 ? "bg-foreground text-background" : "border border-border bg-muted/40 text-muted-foreground"}`}>
            2
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Delivery</p>
            <p className="text-[11px] text-muted-foreground">Shipping address</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 3 ? "bg-foreground text-background" : "border border-border bg-muted/40 text-muted-foreground"}`}>
            3
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Payment</p>
            <p className="text-[11px] text-muted-foreground">Choose method</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 4 ? "bg-foreground text-background" : "border border-border bg-muted/40 text-muted-foreground"}`}>
            4
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Review</p>
            <p className="text-[11px] text-muted-foreground">Confirm order</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] items-start">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Contact Information Card */}
          <div className="rounded-xl border border-border bg-background p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">Contact Information</h2>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll use this information to keep you updated about your order.
                </p>
              </div>
              <Link href="/login" className="text-xs font-semibold text-foreground underline underline-offset-4">
                Already have an account? Login
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">Phone Number *</label>
                <div className="flex">
                  <div className="flex items-center gap-1 rounded-l-md border border-r-0 border-border bg-muted/40 px-3 text-xs font-semibold">
                    <span>🇧🇩</span>
                    <span>+880</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 w-full rounded-r-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.saveInfo}
                onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-medium">
                Save this information for next time
              </span>
            </label>
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-xl border border-border bg-background p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">Delivery Address</h2>
                <p className="text-xs text-muted-foreground">
                  Where should we deliver your order?
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sameBilling}
                  onChange={(e) => setFormData({ ...formData, sameBilling: e.target.checked })}
                  className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">Same as billing address</span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-foreground mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House 12, Road 5, Block C"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Division *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-foreground mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs focus:border-foreground focus:outline-none"
                >
                  <option value="Bangladesh">Bangladesh</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? "Processing Order..." : "Continue to Payment"} <ArrowRight size={15} />
            </button>
            <Link
              href="/cart"
              className="inline-block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <aside className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h2 className="text-base font-bold text-foreground">
              Order Summary ({items.length || 3} items)
            </h2>
            <Link href="/cart" className="text-xs font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground">
              Edit Cart
            </Link>
          </div>

          {/* Items List */}
          <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.sku} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="h-full w-full bg-zinc-200" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.color || "Black"} | Size: {item.size || "M"} | Qty: {item.quantity}
                    </p>
                    <span className="inline-block rounded bg-black px-1 py-0.2 text-[8px] font-bold text-white">
                      22% OFF
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{formatMoney(item.price * item.quantity)}</p>
                  <p className="text-[10px] text-muted-foreground line-through">
                    {formatMoney(Math.round(item.price * item.quantity * 1.25))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal, discount, shipping */}
          <div className="border-t border-border/80 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">{formatMoney(summary.subtotal || 5970)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-semibold">- {formatMoney(summary.couponDiscount || 600)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-semibold text-foreground">Free</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-border/80 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold">Total</span>
              <span className="text-2xl font-extrabold">{formatMoney(summary.grandTotal || 5370)}</span>
            </div>
            <div className="mt-2 rounded-md bg-emerald-50 border border-emerald-100 p-2 text-center text-xs font-semibold text-emerald-700">
              🌱 You saved ৳600 on this order!
            </div>
          </div>

          {/* Coupon */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="h-9 w-full rounded-md border border-border bg-muted/20 pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-md bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
            >
              Apply
            </button>
          </form>
          {couponApplied && (
            <p className="text-[11px] font-medium text-emerald-600">Coupon applied! ৳600 saved.</p>
          )}

          {/* Trust Value Props */}
          <div className="border-t border-border/80 pt-4 grid grid-cols-4 gap-1 text-center text-[9px] text-muted-foreground">
            <div className="space-y-1">
              <Truck size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Free Delivery</p>
              <p>Over ৳3000</p>
            </div>
            <div className="space-y-1">
              <RotateCcw size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Easy Returns</p>
              <p>Within 7 days</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Secure Payment</p>
              <p>100% safe</p>
            </div>
            <div className="space-y-1">
              <Headphones size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">24/7 Support</p>
              <p>We&apos;re here</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

