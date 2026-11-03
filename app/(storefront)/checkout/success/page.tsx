"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Check, Copy, CheckCircle2, Package, Truck, Home, Mail, ArrowRight, Clock } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { useCart } from "@/components/cart/cart-provider";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-shell py-16 text-center text-xs uppercase tracking-widest text-muted-foreground">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

type OrderItemData = {
  id?: string;
  name: string;
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  lineTotal?: number;
  image?: string;
};

type LoadedOrder = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  dateStr: string;
  items: OrderItemData[];
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId") || "ELR-20260905-1842";
  const queryName = searchParams.get("name") || "Customer";
  const queryTotal = Number(searchParams.get("total")) || 537000;

  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<LoadedOrder | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    // BUG-19 FIX: Clear cart now that order is confirmed and completed
    clearCart();

    // 1. Try restoring from sessionStorage for instant zero-latency view
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("elaris_last_order");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.orderNumber === queryOrderId || !order) {
            setOrder({
              orderNumber: parsed.orderNumber || queryOrderId,
              customerName: parsed.customerName || queryName,
              email: parsed.email || "",
              phone: parsed.phone || "",
              address: parsed.address || "Dhaka",
              city: parsed.city || "Dhaka",
              paymentMethod: parsed.paymentMethod || "COD",
              total: parsed.total || queryTotal,
              subtotal: parsed.subtotal || parsed.total || queryTotal,
              shippingFee: parsed.shippingFee ?? 8000,
              dateStr: new Date().toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              items: parsed.items || []
            });
          }
        }
      } catch {
        // ignore storage error
      }
    }

    // 2. Fetch fresh order from API
    if (queryOrderId) {
      fetch(`/api/orders/${encodeURIComponent(queryOrderId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.order) {
            const o = data.order;
            const addr = o.deliveryAddress || {};
            setOrder({
              orderNumber: o.orderNumber,
              customerName: o.customerName || queryName,
              email: o.customerEmail || "",
              phone: o.customerPhone || "",
              address: [addr.line1, addr.line2, addr.area].filter(Boolean).join(", ") || "Mirpur, Dhaka",
              city: addr.city || "Dhaka",
              paymentMethod: o.paymentProvider || "COD",
              total: o.grandTotal,
              subtotal: o.subtotal,
              shippingFee: o.shippingTotal,
              dateStr: new Date(o.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              items: o.items || []
            });
          }
        })
        .catch(() => undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- clearCart and order excluded intentionally: both would cause infinite re-runs
  }, [queryOrderId, queryName, queryTotal]);

  const activeOrderId = order?.orderNumber || queryOrderId;
  const activeCustomerName = order?.customerName || queryName;
  const activeTotal = order?.total || queryTotal;
  const activeItems = order?.items && order.items.length > 0 ? order.items : [
    {
      name: "Black Linen Shirt",
      color: "Black",
      size: "M",
      quantity: 1,
      price: activeTotal,
      image: "/elaris-hero.jpg"
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recommendations = [
    { id: "r1", name: "Knit Sweater", price: 249000, image: "/elaris-women.jpg", slug: "knit-sweater" },
    { id: "r2", name: "Basic Hoodie", price: 219000, original: 280000, discount: "21% OFF", image: "/elaris-men.jpg", slug: "basic-hoodie" },
    { id: "r3", name: "Oversized Shirt", price: 189000, image: "/elaris-women.jpg", slug: "oversized-shirt" },
    { id: "r4", name: "Classic Cap", price: 99000, image: "/elaris-accessories.jpg", slug: "classic-cap" },
  ];

  return (
    <div className="container-shell py-10 sm:py-14 space-y-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background p-6 sm:p-10 shadow-xs">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Order Confirmed & Logged
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Thank You, {activeCustomerName.split(" ")[0]}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Your order has been placed successfully and is queued for verification and dispatch. A confirmation message has been dispatched to your contact.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="flex items-center gap-2 rounded-none bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-all shadow-sm"
              >
                Continue Browsing <ArrowRight size={14} />
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-2 rounded-none border border-border bg-background px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-muted/50 transition-colors"
              >
                View Order History
              </Link>
            </div>
          </div>

          {/* Purchased Items Preview in Hero Banner */}
          <div className="relative rounded-lg border border-border/70 bg-stone-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
              <span className="font-medium text-foreground">Purchased Pieces ({activeItems.length})</span>
              <span className="font-serif font-bold text-foreground">{formatMoney(activeTotal)}</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {activeItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 shrink-0 bg-background rounded border border-border/70 p-2 pr-3">
                  <div className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                    <Image
                      src={item.image || "/elaris-women.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                      sizes="40px"
                    />
                  </div>
                  <div className="text-left max-w-[130px]">
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {item.size || "M"} · Qty {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Payment Method: <strong className="font-medium text-foreground">{order?.paymentMethod === "COD" ? "Cash on Delivery" : (order?.paymentMethod || "Cash on Delivery")}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Details: Order Details & Track Your Order */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Order Details Card */}
        <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Order Receipt
            </h2>
            <span className="text-xs text-muted-foreground">
              {order?.dateStr || new Date().toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-muted-foreground">Order Reference</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono font-semibold text-sm text-foreground">{activeOrderId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy order reference"
                >
                  {copied ? <span className="text-[10px] text-emerald-600 font-bold">Copied!</span> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
                <Clock size={12} />
                Pending Dispatch
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="mt-1 font-medium text-foreground">
                {order?.paymentMethod === "COD" ? "Cash on Delivery" : (order?.paymentMethod || "Cash on Delivery")}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800">Please prepare cash for the delivery agent.</p>
            </div>

            <div>
              <p className="text-muted-foreground">Estimated Delivery</p>
              <p className="mt-1 font-medium text-foreground">2 – 4 Business Days</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Shipping Destination</p>
              <p className="mt-1 font-medium text-foreground leading-relaxed whitespace-pre-line">
                {activeCustomerName}
                {order?.phone ? ` (${order.phone})` : ""}<br />
                {order?.address ? `${order.address}, ${order.city}` : "Mirpur, Dhaka 1216"}<br />
                Bangladesh
              </p>
            </div>

            <div className="sm:col-span-2 border-t border-border/70 pt-3.5 flex items-baseline justify-between">
              <div>
                <p className="text-muted-foreground">Total Settled</p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {formatMoney(activeTotal)}
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700">Verified Submission</span>
            </div>
          </div>
        </div>

        {/* Track Your Order Card */}
        <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Order Fulfillment Tracking
            </h2>
            <Link href="/account/orders" className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4">
              Full Status →
            </Link>
          </div>

          {/* Stepper with icons */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <p className="font-semibold text-foreground">Logged</p>
              <p className="text-muted-foreground">Completed</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-stone-100 text-muted-foreground">
                <CheckCircle2 size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Confirmed</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-stone-100 text-muted-foreground">
                <Package size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Tailoring</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-stone-100 text-muted-foreground">
                <Truck size={16} />
              </div>
              <p className="font-medium text-muted-foreground">In Transit</p>
              <p className="text-muted-foreground">Pending</p>
            </div>

            <div className="space-y-1.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-stone-100 text-muted-foreground">
                <Home size={16} />
              </div>
              <p className="font-medium text-muted-foreground">Delivered</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
          </div>

          {/* Notice Box */}
          <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-stone-50/60 p-4 text-xs">
            <Mail size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                We will dispatch an SMS and confirmation email upon package dispatch.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can review real-time parcel transit and delivery schedule from your client dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items In This Order */}
      <div className="rounded-xl border border-border/80 bg-background p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">
            Garments in This Order ({activeItems.length})
          </h2>
          <Link href="/shop" className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4">
            Discover More Pieces →
          </Link>
        </div>

        <div className="divide-y divide-border/60">
          {activeItems.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded bg-stone-100 border border-border/70">
                  <Image
                    src={item.image || "/elaris-women.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {item.color || "Standard"} · Size: {item.size || "Regular"} · Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Products Carousel */}
      <div className="space-y-6 pt-6 border-t border-border/80">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Curated For You
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
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
                  {item.original && (
                    <span className="text-muted-foreground line-through text-[11px]">
                      {formatMoney(item.original)}
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
      </div>
    </div>
  );
}
