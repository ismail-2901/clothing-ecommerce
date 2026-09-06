"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, Copy, CheckCircle2, Package, Truck, Home, Mail, ArrowRight, Clock } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-shell py-12 text-center text-sm text-muted-foreground">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ELR-20260905-1842";
  const customerName = searchParams.get("name") || "Ismail";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recommendations = [
    { id: "r1", name: "Knit Sweater", price: 2490, image: "/elaris-women.jpg", slug: "knit-sweater" },
    { id: "r2", name: "Basic Hoodie", price: 2190, original: 2800, discount: "21% OFF", image: "/elaris-men.jpg", slug: "basic-hoodie" },
    { id: "r3", name: "Oversized Shirt", price: 1890, image: "/elaris-women.jpg", slug: "oversized-shirt" },
    { id: "r4", name: "Classic Cap", price: 990, image: "/elaris-accessories.jpg", slug: "classic-cap" },
  ];

  return (
    <div className="container-shell py-10 space-y-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 sm:p-10 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <Check size={24} strokeWidth={3} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ORDER PLACED SUCCESSFULLY
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Thank You, {customerName.split(" ")[0]}!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Your order has been placed successfully. We&apos;ll notify you once your order is confirmed.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
              >
                View Order Details
              </Link>
            </div>
          </div>

          {/* Editorial Banner Right Column */}
          <div className="relative hidden lg:flex h-56 rounded-xl overflow-hidden bg-muted/40 items-center justify-between p-6">
            <div className="space-y-1 z-10">
              <p className="font-serif italic text-3xl text-foreground tracking-wide">
                More<br />Than<br />Clothing
              </p>
              <p className="text-[10px] font-bold tracking-widest text-foreground pt-2">ELARIS</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Wear Your Story</p>
            </div>
            <div className="relative h-full w-48 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/elaris-women.jpg"
                alt="Elaris Model"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Details: Order Details & Track Your Order */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Order Details Card */}
        <div className="rounded-xl border border-border bg-background p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h2 className="text-base font-bold text-foreground">Order Details</h2>
            <span className="text-xs text-muted-foreground">Order Date: 5 Sep, 2026 | 10:42 PM</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-muted-foreground">Order Number</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{orderId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy order ID"
                >
                  {copied ? <span className="text-[10px] text-emerald-600 font-bold">Copied!</span> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Order Status</p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Clock size={12} />
                Pending Confirmation
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="mt-1 font-semibold text-foreground">Cash on Delivery</p>
            </div>

            <div>
              <p className="text-muted-foreground">Estimated Delivery</p>
              <p className="mt-1 font-semibold text-foreground">10 - 14 Sep, 2026</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Shipping Address</p>
              <p className="mt-1 font-medium text-foreground leading-relaxed">
                Md. Ismail Hossain<br />
                House 12, Road 5, Block C<br />
                Mirpur, Dhaka 1216<br />
                Bangladesh
              </p>
            </div>

            <div className="sm:col-span-2 border-t border-border/80 pt-3 flex items-baseline justify-between">
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="text-xl font-extrabold text-foreground">{formatMoney(5370)}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">You saved ৳600</span>
            </div>
          </div>
        </div>

        {/* Track Your Order Card */}
        <div className="rounded-xl border border-border bg-background p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h2 className="text-base font-bold text-foreground">Track Your Order</h2>
            <Link href="/account/orders" className="text-xs font-semibold text-foreground hover:underline">
              View Full Tracking →
            </Link>
          </div>

          {/* Stepper with icons */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <p className="font-bold text-foreground">Order Placed</p>
              <p className="text-muted-foreground">5 Sep, 10:42 PM</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground">
                <CheckCircle2 size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Confirmed</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground">
                <Package size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Processing</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground">
                <Truck size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Shipped</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground">
                <Home size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Delivered</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
          </div>

          {/* Notice Box */}
          <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/20 p-4 text-xs">
            <Mail size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-foreground">
                We&apos;ll send you an email and SMS once your order is confirmed.
              </p>
              <p className="text-muted-foreground">
                You can also track your order anytime from your account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items In This Order */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <h2 className="text-base font-bold text-foreground">Items in This Order (3)</h2>
          <Link href="/cart" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            View All Items →
          </Link>
        </div>

        <div className="divide-y divide-border/60">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                <Image src="/elaris-women.jpg" alt="Oversized Hoodie" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Oversized Hoodie</p>
                <p className="text-[11px] text-muted-foreground">Color: Black | Size: M | Qty: 1</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">{formatMoney(2490)}</p>
              <p className="text-[10px] text-muted-foreground line-through">{formatMoney(3200)}</p>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                <Image src="/elaris-women.jpg" alt="Ribbed Tank Top" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Ribbed Tank Top</p>
                <p className="text-[11px] text-muted-foreground">Color: White | Size: S | Qty: 1</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">{formatMoney(1290)}</p>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                <Image src="/elaris-women.jpg" alt="Wide Leg Pants" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Wide Leg Pants</p>
                <p className="text-[11px] text-muted-foreground">Color: Black | Size: M | Qty: 1</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">{formatMoney(2190)}</p>
              <p className="text-[10px] text-muted-foreground line-through">{formatMoney(2800)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like Carousel */}
      <section className="border-t border-border/80 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">You Might Also Like</h2>
          <Link href="/shop" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            View Collection →
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
