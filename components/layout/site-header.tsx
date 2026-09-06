"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserRound, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

const navItems = [
  ["Shop", "/shop"],
  ["Women", "/shop?category=women"],
  ["Men", "/shop?category=men"],
  ["Collections", "/shop"],
  ["Offers", "/offers"],
  ["About", "/about"]
] as const;

export function SiteHeader() {
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="container-shell flex h-[64px] items-center justify-between gap-4">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            aria-label="Open menu"
            className="rounded-md p-1.5 hover:bg-muted text-foreground"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Brand Logo */}
        <Link href="/" className="text-xl sm:text-2xl font-black tracking-[0.14em] uppercase text-foreground">
          ELARIS
        </Link>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-7 text-[13px] font-semibold tracking-[0.06em] text-foreground/80 md:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="hover:text-foreground transition-colors duration-150 relative py-1 hover:border-b-2 hover:border-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Pill Input */}
          <form onSubmit={handleSearch} className="relative hidden lg:block w-64 xl:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="h-9 w-full rounded-full border border-border/90 bg-muted/30 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none transition-all"
            />
          </form>

          {/* Search trigger for mobile */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Search size={19} />
          </Link>

          {/* Account */}
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <UserRound size={19} />
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label={`Wishlist (${wishlistItems.length})`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <Heart size={19} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart (${itemCount})`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm focus:outline-none focus:border-foreground"
            />
          </form>
          <nav className="flex flex-col gap-2">
            {navItems.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

