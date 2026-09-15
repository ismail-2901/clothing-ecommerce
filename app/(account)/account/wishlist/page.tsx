import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  Package,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";
import { WishlistRemoveButton } from "@/components/wishlist/wishlist-remove-button";

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              salePrice: true,
              images: {
                orderBy: { position: "asc" },
                take: 1,
                select: { url: true, alt: true }
              }
            }
          }
        }
      }
    }
  });

  const items = wishlist?.items ?? [];

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

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
        {/* Left Sidebar */}
        <aside className="space-y-6">
          {/* User profile card */}
          <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-sm font-bold text-foreground uppercase">
              {user.name?.charAt(0) ?? "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user.name ?? "Customer"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              <Link href="/account" className="text-[11px] font-semibold text-foreground hover:underline flex items-center gap-1 pt-0.5">
                Edit Profile →
              </Link>
            </div>
          </div>

          {/* Nav */}
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
                {items.length}
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

          {/* Promo card */}
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
                My Wishlist ({items.length})
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Your favorite pieces, all in one place.
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm min-h-[300px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                <Heart size={24} className="fill-muted-foreground/30" />
              </div>
              <h2 className="text-base font-bold text-foreground">Your wishlist is empty</h2>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Browse our collections and tap the heart icon to save pieces you love.
              </p>
              <Link
                href="/shop"
                className="mt-4 flex items-center gap-1.5 rounded-md bg-foreground px-5 py-2.5 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
              >
                Browse Products <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const p = item.product;
                const price = p.salePrice ?? p.basePrice;
                const hasDiscount = !!p.salePrice && p.salePrice < p.basePrice;
                const discountPct = hasDiscount
                  ? Math.round(((p.basePrice - p.salePrice!) / p.basePrice) * 100)
                  : null;
                const imageUrl = p.images[0]?.url ?? "/elaris-women.jpg";
                const imageAlt = p.images[0]?.alt ?? p.name;

                return (
                  <div key={item.id} className="rounded-xl border border-border/80 bg-background p-4 shadow-sm flex flex-col justify-between space-y-4 group">
                    <div>
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted border border-border/60">
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 25vw, 50vw"
                        />
                        {hasDiscount && discountPct && (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-sm">
                            {discountPct}% OFF
                          </span>
                        )}
                        {/* Client remove button — calls DELETE /api/wishlist */}
                        <WishlistRemoveButton productId={p.id} />
                      </div>

                      <div className="mt-3 space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{p.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-extrabold">{formatMoney(price)}</span>
                          {hasDiscount && (
                            <span className="text-muted-foreground line-through text-[11px]">
                              {formatMoney(p.basePrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <Link
                        href={`/products/${p.slug}`}
                        className="flex h-9 w-full items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background hover:bg-foreground/90 transition-colors"
                      >
                        Select Options &amp; Add
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Find more card */}
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
          )}
        </section>
      </div>
    </div>
  );
}
