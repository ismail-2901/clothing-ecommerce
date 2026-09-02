"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, MapPin, PackageCheck, Truck, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";

const steps = [
  ["Contact", UserRound],
  ["Address", MapPin],
  ["Shipping", Truck],
  ["Payment", CreditCard],
  ["Review", PackageCheck]
] as const;

export function CheckoutShell() {
  const { items, summary, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    deliveryName: "",
    deliveryLine1: "",
    deliveryCity: "",
    paymentProvider: "COD"
  });

  const progress = useMemo(
    () => Math.round(((activeStep + 1) / steps.length) * 100),
    [activeStep]
  );

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
          phone: formData.phone,
          deliveryName: formData.deliveryName,
          deliveryLine1: formData.deliveryLine1,
          deliveryCity: formData.deliveryCity,
          deliveryCountry: "BD",
          paymentProvider: formData.paymentProvider,
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
        return;
      }

      setOrderId(result.orderId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-success">
            Order confirmed
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Thank you</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Your order {orderId} has been placed successfully. Check your email for confirmation.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/track/${orderId}`}>Track order</Link>
          </Button>
        </section>
        <aside className="rounded-lg border border-border p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-semibold">Order reference</h2>
          <p className="mt-3 font-mono text-sm">{orderId}</p>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Checkout
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Guest-friendly checkout</h1>
        <div className="mt-8 h-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {steps.map(([label, Icon], index) => (
            <button
              key={label}
              className={`rounded-md border p-3 text-left text-sm ${
                index === activeStep ? "border-foreground" : "border-border"
              }`}
              onClick={() => setActiveStep(index)}
              type="button"
            >
              <Icon aria-hidden="true" size={18} />
              <span className="mt-2 block font-medium">{label}</span>
            </button>
          ))}
        </div>
        <form className="mt-8 grid gap-4 rounded-lg border border-border p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <input
            className="h-11 rounded-md border border-border px-3 text-sm"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            className="h-11 rounded-md border border-border px-3 text-sm"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <input
            className="h-11 rounded-md border border-border px-3 text-sm"
            placeholder="Full name"
            value={formData.deliveryName}
            onChange={(e) => setFormData({ ...formData, deliveryName: e.target.value })}
            required
          />
          <input
            className="h-11 rounded-md border border-border px-3 text-sm"
            placeholder="Delivery address"
            value={formData.deliveryLine1}
            onChange={(e) => setFormData({ ...formData, deliveryLine1: e.target.value })}
            required
          />
          <input
            className="h-11 rounded-md border border-border px-3 text-sm"
            placeholder="City"
            value={formData.deliveryCity}
            onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
            required
          />
          <select
            className="h-11 rounded-md border border-border px-3 text-sm"
            value={formData.paymentProvider}
            onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value })}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="CARD" disabled>
              Card (coming soon)
            </option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Place order"}
          </Button>
        </form>
      </section>
      <aside className="rounded-lg border border-border p-6 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.sku} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">
                  {item.quantity} × {item.size}
                </p>
              </div>
              <span>{formatMoney(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatMoney(summary.shippingFee)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{formatMoney(summary.grandTotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

