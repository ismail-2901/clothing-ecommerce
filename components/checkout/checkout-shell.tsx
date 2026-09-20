"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, RotateCcw, Truck, Headphones, Tag, CreditCard, Wallet, Banknote, CheckCircle2, X, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/utils/money";
import { storePolicies } from "@/config/store";

export function CheckoutShell() {
  const router = useRouter();
  const { items, summary, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    saveInfo: false,
    address: "",
    city: "",
    division: "",
    postalCode: "",
    country: "Bangladesh",
    sameBilling: true,
    paymentMethod: "COD"
  });

  // BUG-29 FIX: Restore saved checkout info from localStorage if user previously opted in
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("elaris_saved_checkout_info");
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            fullName: parsed.fullName || prev.fullName,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            address: parsed.address || prev.address,
            city: parsed.city || prev.city,
            division: parsed.division || prev.division,
            postalCode: parsed.postalCode || prev.postalCode,
            saveInfo: true
          }));
        }
      } catch {
        // ignore storage error
      }
    }
  }, []);

  // BUG-17 FIX: Validate coupon code with server endpoint rather than blindly accepting any string
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          cartSubtotal: summary.subtotal || 0,
          shippingFee: summary.shippingFee || 0
        })
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setCouponError(data.error || "Invalid coupon code.");
        setCouponApplied(false);
        setAppliedDiscount(null);
        setAppliedCouponCode("");
      } else {
        setCouponApplied(true);
        setAppliedDiscount(data.discountAmount);
        setAppliedCouponCode(data.code);
        setCouponError("");
      }
    } catch {
      setCouponError("Failed to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setAppliedDiscount(null);
    setAppliedCouponCode("");
    setCouponError("");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // BUG-30 FIX: Strip leading +880, 880, or 0 before standardizing to +880 format
      const cleanPhone = formData.phone.trim().replace(/^(\+?880|0)+/, "");
      const formattedPhone = `+880${cleanPhone}`;

      // BUG-29 FIX: Persist or remove saved user details in localStorage
      if (typeof window !== "undefined") {
        try {
          if (formData.saveInfo) {
            localStorage.setItem(
              "elaris_saved_checkout_info",
              JSON.stringify({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                division: formData.division,
                postalCode: formData.postalCode
              })
            );
          } else {
            localStorage.removeItem("elaris_saved_checkout_info");
          }
        } catch {
          // ignore storage error
        }
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formattedPhone,
          deliveryAddress: {
            name: formData.fullName,
            line1: formData.address,
            city: formData.city,
            area: formData.division,
            postalCode: formData.postalCode,
            country: "BD"
          },
          paymentProvider: formData.paymentMethod,
          couponCode: couponApplied && appliedCouponCode ? appliedCouponCode : undefined,
          // variantId + quantity only — server resolves price, name, stock from DB
          cartItems: items
            .filter((item) => !!item.variantId)
            .map((item) => ({
              variantId: item.variantId!,
              quantity: item.quantity
            }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Checkout failed.");
        setLoading(false);
        return;
      }

      const generatedId = result.orderNumber || result.orderId || `ELR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-1842`;
      const effectiveDiscount = appliedDiscount ?? summary.couponDiscount ?? 0;
      const effectiveTotal = Math.max(0, (summary.subtotal ?? 0) - effectiveDiscount + (summary.shippingFee ?? 0));
      const confirmedTotal = result.grandTotal ?? effectiveTotal;

      // Save order snapshot to sessionStorage for reliable instant feedback on success page
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem("elaris_last_order", JSON.stringify({
            orderNumber: generatedId,
            customerName: formData.fullName,
            email: formData.email,
            phone: formattedPhone,
            address: formData.address,
            city: formData.city,
            paymentMethod: formData.paymentMethod,
            total: confirmedTotal,
            subtotal: summary.subtotal || 0,
            shippingFee: summary.shippingFee,
            items: items.map((item) => ({
              name: item.name,
              sku: item.sku,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              price: item.unitPrice ?? item.price,
              image: item.image
            }))
          }));
        } catch {
          // ignore storage errors
        }
      }

      // BUG-19 FIX: For payment gateways that redirect, do NOT clearCart here.
      // If the redirect fails or user cancels at gateway, cart is preserved.
      // Cart will be cleared on the checkout/success page upon verified payment.
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // COD or immediate success: clear cart now
      await clearCart();
      router.push(`/checkout/success?orderId=${generatedId}&name=${encodeURIComponent(formData.fullName)}&total=${confirmedTotal}`);
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

      {/* 4-Step Stepper (BUG-44 FIX: dynamic step indicator) */}
      {(() => {
        const isContactFilled = Boolean(formData.fullName.trim() && formData.email.trim() && formData.phone.trim());
        const isDeliveryFilled = isContactFilled && Boolean(formData.address.trim() && formData.city.trim());
        const isPaymentFilled = Boolean(formData.paymentMethod);
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isContactFilled ? "bg-emerald-600 text-white" : "bg-foreground text-background"}`}>
                {isContactFilled ? "✓" : "1"}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Contact</p>
                <p className="text-[11px] text-muted-foreground">{isContactFilled ? "Completed" : "Your details"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDeliveryFilled ? "bg-emerald-600 text-white" : isContactFilled ? "bg-foreground text-background" : "border border-border bg-muted/40 text-muted-foreground"}`}>
                {isDeliveryFilled ? "✓" : "2"}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Delivery</p>
                <p className="text-[11px] text-muted-foreground">{isDeliveryFilled ? "Completed" : "Shipping address"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDeliveryFilled && isPaymentFilled ? "bg-foreground text-background" : "border border-border bg-muted/40 text-muted-foreground"}`}>
                3
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Payment</p>
                <p className="text-[11px] text-muted-foreground">{formData.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-xs font-bold text-muted-foreground">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Review</p>
                <p className="text-[11px] text-muted-foreground">Confirm order</p>
              </div>
            </div>
          </div>
        );
      })()}

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

          {/* Payment Method Selection Card */}
          <div className="rounded-xl border border-border bg-background p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Payment Method</h2>
              <p className="text-xs text-muted-foreground">
                Select how you would like to pay for your order.
              </p>
            </div>

            <div className="grid gap-3 pt-2">
              {[
                {
                  id: "COD",
                  name: "Cash on Delivery",
                  desc: "Pay in cash when your order arrives. Standard Bangladesh delivery.",
                  badge: "Most Popular",
                  icon: Banknote
                },
                {
                  id: "BKASH",
                  name: "bKash",
                  desc: "Instant payment using your personal bKash mobile wallet.",
                  badge: "Instant",
                  icon: Wallet
                },
                {
                  id: "NAGAD",
                  name: "Nagad",
                  desc: "Fast checkout using your Nagad account with 0% extra fee.",
                  badge: "Instant",
                  icon: Wallet
                },
                {
                  id: "SSLCOMMERZ",
                  name: "SSLCommerz Gateway",
                  desc: "All BD cards, internet banking, and mobile financial services.",
                  badge: "Multi-Gateway",
                  icon: ShieldCheck
                },
                {
                  id: "CARD",
                  name: "Credit / Debit Card",
                  desc: "Direct card payment via Visa, MasterCard, or American Express.",
                  badge: "Encrypted",
                  icon: CreditCard
                }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-foreground bg-foreground/[0.03] shadow-sm ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40 bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mt-1 h-4 w-4 border-border text-foreground accent-foreground cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
                        <span className="text-xs font-bold text-foreground">{method.name}</span>
                        {method.badge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground uppercase">
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? (
                "Processing Order..."
              ) : formData.paymentMethod === "COD" ? (
                <>Place Order (Cash on Delivery) <ArrowRight size={15} /></>
              ) : (
                <>Proceed to {formData.paymentMethod} Payment <ArrowRight size={15} /></>
              )}
            </button>
            <Link
              href="/cart"
              className="inline-block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </form>

        {/* Right Column: Order Summary (BUG-18 FIX: Real pricing, no fake hardcoded numbers) */}
        {(() => {
          const effectiveSubtotal = summary.subtotal ?? 0;
          const effectiveDiscount = appliedDiscount ?? summary.couponDiscount ?? 0;
          const effectiveShipping = summary.shippingFee ?? 0;
          const effectiveGrandTotal = Math.max(0, effectiveSubtotal - effectiveDiscount + effectiveShipping);

          return (
            <aside className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                </h2>
                <Link href="/cart" className="text-xs font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  Edit Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">Your cart is empty.</p>
                ) : (
                  items.map((item) => {
                    const itemPrice = item.unitPrice ?? item.price;
                    return (
                      <div key={item.id || item.sku} className="py-3 flex items-center justify-between gap-3">
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
                              {item.color || "Default"} | Size: {item.size || "Standard"} | Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{formatMoney(itemPrice * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Subtotal, discount, shipping */}
              <div className="border-t border-border/80 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatMoney(effectiveSubtotal)}</span>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">- {formatMoney(effectiveDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-foreground">
                    {effectiveShipping === 0 ? "Free" : formatMoney(effectiveShipping)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border/80 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-2xl font-extrabold">{formatMoney(effectiveGrandTotal)}</span>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="mt-2 rounded-md bg-emerald-50 border border-emerald-100 p-2 text-center text-xs font-semibold text-emerald-700">
                    🌱 You saved {formatMoney(effectiveDiscount)} on this order!
                  </div>
                )}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      disabled={couponApplied || couponLoading}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="h-9 w-full rounded-md border border-border bg-muted/20 pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="h-9 rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-9 rounded-md bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {couponLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                      Apply
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Coupon &quot;{appliedCouponCode}&quot; applied! ({formatMoney(effectiveDiscount)} saved)
                  </p>
                )}
              </form>

          {/* Trust Value Props */}
          <div className="border-t border-border/80 pt-4 grid grid-cols-4 gap-1 text-center text-[9px] text-muted-foreground">
            <div className="space-y-1">
              <Truck size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Free Delivery</p>
              <p>{storePolicies.shipping.freeDeliveryShort}</p>
            </div>
            <div className="space-y-1">
              <RotateCcw size={16} className="mx-auto text-foreground/80" />
              <p className="font-bold text-foreground">Easy Returns</p>
              <p>{storePolicies.returns.shortLabel}</p>
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
          );
        })()}
      </div>
    </div>
  );
}

