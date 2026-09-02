"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";

export function CartPageContent() {
  const { items, summary, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-shell grid min-h-[60vh] place-items-center py-12">
        <div className="max-w-md text-center">
          <ShoppingBag aria-hidden="true" className="mx-auto" size={36} />
          <h1 className="mt-4 text-3xl font-semibold">Your cart is empty</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add a few refined essentials to continue building your outfit.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        {items.map((item) => (
          <div key={item.sku} className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[120px_1fr_auto]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.color} · {item.size}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md p-2 hover:bg-muted"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => removeItem(item.sku)}
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-muted"
                    aria-label={`Decrease quantity for ${item.name}`}
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                  >
                    <Minus aria-hidden="true" size={16} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-muted"
                    aria-label={`Increase quantity for ${item.name}`}
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                  >
                    <Plus aria-hidden="true" size={16} />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{formatMoney(item.price)} each</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-lg font-semibold">{formatMoney(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </section>

      <aside className="rounded-lg border border-border p-6 lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatMoney(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{formatMoney(summary.shippingFee)}</dd>
          </div>
          {summary.couponDiscount > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Coupon</dt>
              <dd>-{formatMoney(summary.couponDiscount)}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(summary.grandTotal)}</span>
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
      </aside>
    </div>
  );
}
