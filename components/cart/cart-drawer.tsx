"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/utils/money";
import { storePolicies } from "@/config/store";

const FREE_THRESHOLD_MINOR = storePolicies.shipping.freeThreshold * 100;

export function CartDrawer() {
  const { items, itemCount, summary, isDrawerOpen, closeDrawer, updateQuantity, removeItem } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Trap focus inside drawer while open
  useEffect(() => {
    if (!isDrawerOpen) return;
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
      if (e.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  const subtotal = summary.subtotal;
  const progressPct = Math.min(100, Math.round((subtotal / FREE_THRESHOLD_MINOR) * 100));
  const remaining = FREE_THRESHOLD_MINOR - subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your shopping bag"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-foreground" />
            <span className="text-sm font-bold tracking-tight">
              Your Bag{itemCount > 0 ? ` (${itemCount})` : ""}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free delivery progress */}
        {items.length > 0 && (
          <div className="shrink-0 border-b border-border px-5 py-3 space-y-1.5">
            {subtotal >= FREE_THRESHOLD_MINOR ? (
              <p className="text-xs font-semibold text-emerald-600">
                🎉 You&apos;ve unlocked free delivery!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add{" "}
                <span className="font-bold text-foreground">{formatMoney(remaining)}</span>{" "}
                more for free delivery
              </p>
            )}
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <ShoppingBag size={40} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Your bag is empty</p>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-xs font-bold underline underline-offset-4 hover:text-foreground"
              >
                Continue shopping →
              </button>
            </div>
          ) : (
            items.map((item) => {
              const key = item.id || item.sku;
              return (
                <div key={key} className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 py-0.5">
                    <p className="text-xs font-semibold leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-sm font-bold">
                      {formatMoney((item.unitPrice ?? item.price) * item.quantity)}
                    </p>

                    {/* Qty stepper + remove */}
                    <div className="mt-auto flex items-center gap-2">
                      <div className="inline-flex h-7 items-center rounded border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="px-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          className="px-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(key)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{formatMoney(summary.subtotal)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
            >
              Checkout <ArrowRight size={14} />
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="flex h-10 w-full items-center justify-center rounded-md border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              View Bag
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
