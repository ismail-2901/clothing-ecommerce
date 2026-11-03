"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, RotateCcw, Truck, Headphones, Tag, CreditCard, Wallet, Banknote, CheckCircle2, X, Loader2, Sparkles } from "lucide-react";
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
    division: "Dhaka",
    postalCode: "",
    country: "Bangladesh",
    sameBilling: true,
    paymentMethod: "COD"
  });

  // MED-03: Remove sensitive checkout PII from persistent localStorage.
  // Transient session-scoped memory/sessionStorage is used during an active checkout session only.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("elaris_saved_checkout_info");
        const saved = sessionStorage.getItem("elaris_checkout_session_info");
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

      // MED-03: Remove sensitive customer PII from persistent localStorage.
      // Transient sessionStorage scoped to the current browser tab session is used when user opts in.
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("elaris_saved_checkout_info");
          if (formData.saveInfo) {
            sessionStorage.setItem(
              "elaris_checkout_session_info",
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
            sessionStorage.removeItem("elaris_checkout_session_info");
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
      // MED-08: Make server-calculated grandTotal the authoritative source of truth.
      const confirmedTotal = typeof result.grandTotal === "number" ? result.grandTotal : effectiveTotal;

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

      // COD or immediate success: clear cart and clear session PII now
      try {
        sessionStorage.removeItem("elaris_checkout_session_info");
      } catch {
        // ignore storage error
      }
      await clearCart();
      router.push(`/checkout/success?orderId=${generatedId}&name=${encodeURIComponent(formData.fullName)}&total=${confirmedTotal}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  // Visual 3-step progress checks
  const isContactFilled = Boolean(formData.fullName.trim() && formData.email.trim() && formData.phone.trim());
  const isDeliveryFilled = isContactFilled && Boolean(formData.address.trim() && formData.city.trim());
  const isPaymentSelected = Boolean(formData.paymentMethod);

  // Price calculations
  const effectiveSubtotal = summary.subtotal ?? 0;
  const effectiveDiscount = appliedDiscount ?? summary.couponDiscount ?? 0;
  const effectiveShipping = summary.shippingFee ?? 0;
  const effectiveGrandTotal = Math.max(0, effectiveSubtotal - effectiveDiscount + effectiveShipping);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/70 pb-6 sm:pb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link href="/cart" className="hover:text-foreground transition-colors">Shopping Bag</Link>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Checkout</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Complete your shipping destination and select your payment preference.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-stone-50/60 px-4 py-2 text-xs text-muted-foreground">
          <Lock size={14} className="text-foreground" />
          <span className="font-medium text-foreground">256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {/* 3-Step Visual Progress Stepper */}
      <div className="grid grid-cols-3 gap-3 border-b border-border/70 pb-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            isDeliveryFilled ? "bg-stone-900 text-white" : "bg-stone-900 text-white"
          }`}>
            {isDeliveryFilled ? "✓" : "1"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
              1. Delivery & Contact
            </p>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              {isDeliveryFilled ? "Details verified" : "Destination details"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            isDeliveryFilled && isPaymentSelected ? "bg-stone-900 text-white" : "border border-border bg-stone-100 text-muted-foreground"
          }`}>
            {isPaymentSelected && isDeliveryFilled ? "✓" : "2"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
              2. Payment Method
            </p>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              {formData.paymentMethod === "COD" ? "Cash on Delivery" : formData.paymentMethod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border border-border transition-colors ${
            isDeliveryFilled && isPaymentSelected ? "border-stone-900 text-stone-900" : "bg-stone-100 text-muted-foreground"
          }`}>
            3
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
              3. Confirmation
            </p>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              Review & place order
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Forms (Left) & Order Summary (Right) */}
      <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr] items-start">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-800 flex items-start gap-2.5">
              <span className="text-red-500 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contact & Delivery Information */}
          <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
                  1. Contact & Delivery Destination
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We use these details to dispatch and track your shipment.
                </p>
              </div>
              <Link href="/login" className="text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity">
                Returning customer? Sign in
              </Link>
            </div>

            <div className="space-y-5">
              {/* Contact Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Mahfuz Rahman"
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. name@example.com"
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Phone Number (for courier contact) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <div className="flex items-center gap-1.5 rounded-l border border-r-0 border-border bg-stone-100/70 px-3.5 text-xs font-medium text-foreground">
                      <span>🇧🇩</span>
                      <span className="font-mono text-muted-foreground">+880</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="h-11 w-full rounded-r border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Fields */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Street Address & House / Flat No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House 12, Road 5, Block C, Banani"
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dhaka"
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3 text-xs text-foreground focus:border-foreground focus:bg-background focus:outline-none cursor-pointer transition-colors"
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
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="1213"
                    className="h-11 w-full rounded border border-border bg-stone-50/30 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-foreground mb-1.5 uppercase tracking-wider">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="h-11 w-full rounded border border-border bg-stone-100/50 px-3 text-xs text-foreground focus:outline-none"
                    disabled
                  >
                    <option value="Bangladesh">Bangladesh</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.saveInfo}
                    onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">
                    Save delivery information for faster checkout next time
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.sameBilling}
                    onChange={(e) => setFormData({ ...formData, sameBilling: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">
                    Billing address matches shipping address
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="border-b border-border/60 pb-4">
              <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
                2. Payment Method
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All transactions are encrypted and secured. Choose your preferred method.
              </p>
            </div>

            <div className="grid gap-3 pt-1">
              {[
                {
                  id: "COD",
                  name: "Cash on Delivery",
                  desc: "Pay in cash when your parcel arrives at your doorstep. Standard delivery nationwide across Bangladesh.",
                  badge: "Recommended",
                  icon: Banknote,
                  disabled: false
                },
                {
                  id: "BKASH",
                  name: "bKash Mobile Wallet",
                  desc: "Instant payment via bKash mobile gateway. (Merchant integration onboarding in progress).",
                  badge: "Coming Soon",
                  icon: Wallet,
                  disabled: true
                },
                {
                  id: "NAGAD",
                  name: "Nagad Account",
                  desc: "Seamless digital payment with your Nagad wallet. (Merchant integration onboarding in progress).",
                  badge: "Coming Soon",
                  icon: Wallet,
                  disabled: true
                },
                {
                  id: "SSLCOMMERZ",
                  name: "SSLCommerz Gateway",
                  desc: "All Bangladesh debit/credit cards, internet banking, and mobile financial services.",
                  badge: "Coming Soon",
                  icon: ShieldCheck,
                  disabled: true
                },
                {
                  id: "CARD",
                  name: "Visa / Mastercard / Amex",
                  desc: "Direct debit or credit card settlement.",
                  badge: "Coming Soon",
                  icon: CreditCard,
                  disabled: true
                }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 rounded-lg border p-4.5 transition-all ${
                      method.disabled
                        ? "opacity-50 cursor-not-allowed bg-stone-50/40 border-border/50"
                        : isSelected
                        ? "border-foreground bg-stone-50/70 shadow-xs ring-1 ring-foreground cursor-pointer"
                        : "border-border hover:border-foreground/50 bg-background cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      disabled={method.disabled}
                      onChange={(e) => {
                        if (!method.disabled) {
                          setFormData({ ...formData, paymentMethod: e.target.value });
                        }
                      }}
                      className="mt-1 h-4 w-4 border-border text-foreground accent-foreground disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
                        <span className="text-xs font-semibold text-foreground">{method.name}</span>
                        {method.badge && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            method.disabled
                              ? "bg-stone-200/60 text-stone-600"
                              : "bg-stone-900 text-white"
                          }`}>
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {method.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Order Review & Confirmation Action */}
          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-none bg-foreground text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 disabled:opacity-50 transition-all shadow-md active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Processing Order...
                </>
              ) : formData.paymentMethod === "COD" ? (
                <>
                  Confirm Order ({formatMoney(effectiveGrandTotal)}) <ArrowRight size={15} />
                </>
              ) : (
                <>
                  Proceed to {formData.paymentMethod} Payment <ArrowRight size={15} />
                </>
              )}
            </button>
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <Link
                href="/cart"
                className="hover:text-foreground transition-colors underline underline-offset-4"
              >
                ← Return to Shopping Bag
              </Link>
              <span className="text-[11px]">7-Day Complimentary Exchange Guarantee</span>
            </div>
          </div>
        </form>

        {/* Right Column: Order Review & Sticky Summary */}
        <aside className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Order Summary ({items.length})
            </h2>
            <Link
              href="/cart"
              className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Modify
            </Link>
          </div>

          {/* Purchased Items List */}
          <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Your shopping bag is empty.</p>
            ) : (
              items.map((item) => {
                const itemPrice = item.unitPrice ?? item.price;
                return (
                  <div key={item.id || item.sku} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Standard 3:4 aspect thumbnail */}
                      <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded bg-stone-100 border border-border/70">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover object-top"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full bg-stone-100" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {item.color || "Default"} · {item.size || "Standard"} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-foreground">
                        {formatMoney(itemPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Subtotal, discount, shipping breakdown */}
          <div className="border-t border-border/70 pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{formatMoney(effectiveSubtotal)}</span>
            </div>
            {effectiveDiscount > 0 && (
              <div className="flex justify-between text-amber-900 font-medium">
                <span>Promotional Discount</span>
                <span>- {formatMoney(effectiveDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping & Handling</span>
              <span className="font-medium text-foreground">
                {effectiveShipping === 0 ? "Complimentary" : formatMoney(effectiveShipping)}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="border-t border-border/70 pt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                Grand Total
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                {formatMoney(effectiveGrandTotal)}
              </span>
            </div>

            {/* Cash on Delivery Notice */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 p-3.5 text-amber-950">
              <Banknote size={16} className="shrink-0 text-amber-700 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-amber-950">Payment on Arrival (Cash on Delivery)</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  No advance payment is needed. Please hand{" "}
                  <strong className="font-semibold">{formatMoney(effectiveGrandTotal)}</strong> to the delivery agent upon receipt of your parcel.
                </p>
              </div>
            </div>
          </div>

          {/* Coupon Input Form */}
          <div className="border-t border-border/70 pt-4">
            {couponApplied ? (
              <div className="flex items-center justify-between rounded border border-amber-300/80 bg-amber-50/60 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-amber-700" />
                  <span className="text-xs font-semibold text-amber-950">{appliedCouponCode}</span>
                  <span className="text-[11px] text-amber-800">(-{formatMoney(effectiveDiscount)})</span>
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
                      disabled={couponApplied || couponLoading}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promotional code"
                      className="h-10 w-full rounded border border-border bg-stone-50/40 pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-10 rounded-none bg-foreground px-4 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                )}
              </form>
            )}
          </div>

          {/* Reassurance Pillars */}
          <div className="border-t border-border/70 pt-4 grid grid-cols-4 gap-1 text-center text-[9px] text-muted-foreground">
            <div className="space-y-1">
              <Truck size={15} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Nationwide</p>
              <p>{storePolicies.shipping.freeDeliveryShort}</p>
            </div>
            <div className="space-y-1">
              <RotateCcw size={15} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Exchange</p>
              <p>{storePolicies.returns.shortLabel}</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck size={15} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Secure</p>
              <p>Certified</p>
            </div>
            <div className="space-y-1">
              <Headphones size={15} className="mx-auto text-foreground/80 stroke-[1.5]" />
              <p className="font-semibold text-foreground">Care</p>
              <p>24/7 Support</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
