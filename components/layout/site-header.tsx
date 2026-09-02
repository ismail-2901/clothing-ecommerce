"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { storeConfig } from "@/config/store";

const navItems = [
  ["Shop", "/shop"],
  ["Categories", "/shop"],
  ["Offers", "/offers"]
] as const;

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:hidden">
          <button aria-label="Open menu" className="rounded-md p-2 hover:bg-muted" type="button">
            <Menu aria-hidden="true" size={21} />
          </button>
        </div>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {storeConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map(([label, href]) => (
            <Link key={label} href={href} className="text-muted-foreground hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <IconLink href="/search" label="Search">
            <Search aria-hidden="true" size={20} />
          </IconLink>
          <IconLink href="/account" label="Account" className="hidden md:inline-flex">
            <UserRound aria-hidden="true" size={20} />
          </IconLink>
          <IconLink href="/account/wishlist" label="Wishlist" className="hidden md:inline-flex">
            <Heart aria-hidden="true" size={20} />
          </IconLink>
          <IconLink href="/cart" label="Cart">
            <ShoppingBag aria-hidden="true" size={20} />
            <span className="sr-only">Cart items</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-semibold text-background">
              {itemCount}
            </span>
          </IconLink>
        </div>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  className,
  children
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 items-center justify-center gap-1 rounded-md px-2 hover:bg-muted ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

