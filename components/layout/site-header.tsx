"use client";

import Link from "next/link";
import { Search, UserRound, ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { storeConfig } from "@/config/store";

const navItems = [
  ["Women", "/shop?category=women"],
  ["Men", "/shop?category=men"],
  ["Collections", "/shop"],
  ["Offers", "/offers"],
  ["About", "/about"]
] as const;

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-shell flex h-[60px] items-center justify-between gap-4">
        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button aria-label="Open menu" className="rounded-md p-2 hover:bg-muted" type="button">
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-[0.08em] uppercase">
          {storeConfig.name}
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-[0.06em] uppercase md:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-0.5">
          <IconLink href="/search" label="Search">
            <Search aria-hidden="true" size={20} />
          </IconLink>
          <IconLink href="/account" label="Account" className="hidden md:inline-flex">
            <UserRound aria-hidden="true" size={20} />
          </IconLink>
          <IconLink href="/cart" label={`Cart (${itemCount})`}>
            <div className="relative">
              <ShoppingBag aria-hidden="true" size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {itemCount}
                </span>
              )}
            </div>
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

