"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const subtotal = summary.subtotal;
  const progressPct = Math.min(100, Math.round((subtotal / FREE_THRESHOLD_MINOR) * 100));
  const remaining = FREE_THRESHOLD_MINOR - subtotal;
  const isFreeUnlocked = subtotal >= FREE_THRESHOLD_MINOR;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your shopping bag"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-background border-l border-border/80 shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-6">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={17} className="text-foreground stroke-[1.75]" />
            <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Shopping Bag
            </h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">
                {itemCount}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free delivery progress */}
        {items.length > 0 && (
          <div className="shrink-0 border-b border-border/70 bg-stone-50/50 px-6 py-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              {isFreeUnlocked ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-amber-900">
                  <Sparkles size={13} className="text-amber-600 fill-amber-500/20" />
                  Complimentary delivery unlocked
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Add <strong className="font-semibold text-foreground">{formatMoney(remaining)}</strong> more for complimentary delivery
                </span>
              )}
              <span className="text-[10px] font-mono font-medium text-muted-foreground">
                {progressPct}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-stone-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isFreeUnlocked ? "bg-amber-600" : "bg-foreground"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-16 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground">
                  Your Bag is Empty
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                  Explore curated wardrobe essentials crafted with exquisite tailoring and refined silhouettes.
                </p>
              </div>
              <div className="flex flex-col w-full max-w-[240px] gap-2 pt-2">
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="flex h-11 items-center justify-center rounded-none bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-foreground/90 transition-colors"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/shop?category=women"
                  onClick={closeDrawer}
                  className="flex h-9 items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Women&apos;s Edition →
                </Link>
                <Link
                  href="/shop?category=men"
                  onClick={closeDrawer}
                  className="flex h-9 items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Men&apos;s Edition →
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const key = item.id || item.sku;
              const unitPrice = item.unitPrice ?? item.price;
              const lineTotal = unitPrice * item.quantity;
              return (
                <div key={key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Thumbnail (Standard 3:4 apparel ratio) */}
                  <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded bg-stone-100 border border-border/70">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                    ) : (
                      <div className="h-full w-full bg-stone-100" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(key)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        {item.color ? item.color : "Default"}
                        {item.size ? ` · ${item.size}` : ""}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-1">
                      {/* Qty stepper (44px min tap bounds) */}
                      <div className="inline-flex h-8 items-center rounded border border-border bg-background shadow-xs">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-[28px] text-center text-xs font-semibold text-foreground select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          className="flex h-full min-w-[32px] items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Line total price */}
                      <span className="text-xs font-semibold tracking-tight text-foreground">
                        {formatMoney(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border/80 bg-background px-6 py-5 space-y-3.5 shadow-lg">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Subtotal
              </span>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                {formatMoney(summary.subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Complimentary shipping & taxes computed at checkout.
            </p>
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-none bg-foreground text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-all shadow-sm active:scale-[0.99]"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="flex h-10 w-full items-center justify-center rounded-none border border-border text-xs font-medium uppercase tracking-[0.14em] text-foreground hover:bg-muted/50 transition-colors"
              >
                Review Shopping Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
