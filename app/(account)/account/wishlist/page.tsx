"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  Heart,
  LayoutDashboard,
  Package,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  ArrowRight,
  UserRound
} from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/utils/money";

type WishlistItemDisplay = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colors?: string[];
  original?: number;
  discount?: string;
  badge?: string;
};

const mockWishlistDefault: WishlistItemDisplay[] = [
  { id: "w1", slug: "oversized-hoodie", name: "Oversized Hoodie", price: 249000, original: 320000, discount: "22% OFF", badge: "Bestseller", colors: ["#111111", "#E5DCC5", "#4B5320"], image: "/elaris-women.jpg" },
  { id: "w2", slug: "ribbed-tank-top", name: "Ribbed Tank Top", price: 129000, badge: "New", colors: ["#F9F9F9", "#F7D0D0", "#111111", "#9CA3AF"], image: "/elaris-women.jpg" },
  { id: "w3", slug: "knit-sweater", name: "Knit Sweater", price: 249000, colors: ["#F5EFE6", "#D5C7B7", "#6B7280", "#111111"], image: "/elaris-women.jpg" },
  { id: "w4", slug: "classic-blazer", name: "Classic Blazer", price: 399000, badge: "New", colors: ["#111111", "#78716C"], image: "/elaris-women.jpg" },
  { id: "w5", slug: "classic-cap", name: "Classic Cap", price: 99000, colors: ["#111111", "#E7E5E4", "#D6C7B2"], image: "/elaris-accessories.jpg" }
];

export default function AccountWishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const displayItems: WishlistItemDisplay[] = items.length > 0
    ? items.map((i) => ({
        id: i.productId,
        slug: i.slug,
        name: i.name,
        price: i.price,
        image: i.image || "/elaris-women.jpg",
        colors: ["#111111", "#E5DCC5"]
      }))
    : mockWishlistDefault;

  return (
    <div className="container-shell py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/account" className="hover:text-foreground">My Account</Link>
        <span>/</span>
        <span className="text-foreground">Wishlist</span>
      </nav>

      {/* Grid: Left Account Sidebar + Main Content */}
      <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
        {/* Left Customer Sidebar */}
        <aside className="space-y-6">
          {/* User Profile Card */}
          <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 shadow-sm">
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
              <Image src="/elaris-hero.jpg" alt="Ismail" fill className="object-cover" sizes="48px" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">Md. Ismail Hossain</p>
              <p className="text-[11px] text-muted-foreground truncate">ismailhossain@email.com</p>
              <Link href="/account" className="text-[11px] font-semibold text-foreground hover:underline flex items-center gap-1 pt-0.5">
                Edit Profile →
              </Link>
            </div>
          </div>

          {/* Nav List */}
          <div className="rounded-xl border border-border bg-background p-2 space-y-1 shadow-sm text-xs font-semibold text-muted-foreground">
            <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <LayoutDashboard size={16} /> Overview
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <Package size={16} /> My Orders
            </Link>
            <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <MapPin size={16} /> Addresses
            </Link>
            <Link href="/account/wishlist" className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-foreground font-bold transition-colors">
              <div className="flex items-center gap-3">
                <Heart size={16} className="fill-foreground text-foreground" /> Wishlist
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background px-1.5">
                {displayItems.length}
              </span>
            </Link>
            <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <Bell size={16} /> Notifications
            </Link>
            <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <Settings size={16} /> Account Settings
            </Link>
            <Link href="/contact" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground transition-colors">
              <HelpCircle size={16} /> Help &amp; Support
            </Link>
          </div>

          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-stone-100 p-5 space-y-3">
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-stone-200">
              <Image src="/elaris-women.jpg" alt="Style Stays With You" fill className="object-cover" sizes="240px" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ELARIS</p>
              <h3 className="text-sm font-bold text-foreground">Style Stays With You</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Save your favorites today, wear them tomorrow.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Wishlist Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                My Wishlist ({displayItems.length})
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Your favorite pieces, all in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Wishlist link copied to clipboard!");
              }}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors"
            >
              <Share2 size={14} /> Share Wishlist
            </button>
          </div>

          {/* Wishlist Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {displayItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/80 bg-background p-4 shadow-sm flex flex-col justify-between space-y-4 group">
                <div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted border border-border/60">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                    {item.badge && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white text-rose-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={14} className="fill-current" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold">{formatMoney(item.price)}</span>
                      {item.original && (
                        <span className="text-muted-foreground line-through text-[11px]">
                          {formatMoney(item.original)}
                        </span>
                      )}
                      {item.discount && (
                        <span className="rounded bg-black px-1.5 py-0.2 text-[9px] font-bold text-white">
                          {item.discount}
                        </span>
                      )}
                    </div>
                    {item.colors && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {item.colors.map((c, i) => (
                          <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        sku: `${item.id}_default`,
                        productId: item.id,
                        name: item.name,
                        size: "M",
                        color: "Black",
                        price: item.price,
                        quantity: 1,
                        image: item.image
                      })
                    }
                    className="flex h-9 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background hover:bg-foreground/90 transition-colors"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex h-9 items-center justify-center rounded-md border border-border bg-background text-[11px] font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}

            {/* Find More to Love Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-muted/20 p-6 text-center space-y-3 min-h-[340px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Heart size={20} className="fill-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Find more to love</h3>
              <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                Explore our latest collections and add your favorites here.
              </p>
              <Link
                href="/shop"
                className="flex items-center gap-1.5 rounded-md bg-foreground px-5 py-2.5 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
              >
                Continue Shopping <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
