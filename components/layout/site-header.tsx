"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, UserRound, Heart, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { SearchAutocomplete } from "@/components/layout/search-autocomplete";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

const navItems = [
  ["Shop", "/shop"],
  ["Women", "/shop?category=women"],
  ["Men", "/shop?category=men"],
  ["Offers", "/offers"],
  ["About", "/about"]
] as const;

type NavLabel = (typeof navItems)[number][0];

const megaMenuData: Record<
  string,
  {
    title: string;
    categories: { label: string; href: string }[];
    featured: { title: string; subtitle: string; href: string; image: string };
  }
> = {
  Shop: {
    title: "All Collections",
    categories: [
      { label: "New Arrivals '25", href: "/shop" },
      { label: "Women's Capsule", href: "/shop?category=women" },
      { label: "Men's Essentials", href: "/shop?category=men" },
      { label: "Tactile Knitwear", href: "/shop" },
      { label: "Promotional Offers", href: "/offers" }
    ],
    featured: {
      title: "Capsule '25",
      subtitle: "Form, Function & Fluidity",
      href: "/shop",
      image: "/elaris-hero.jpg"
    }
  },
  Women: {
    title: "Women's Capsule",
    categories: [
      { label: "View All Women's", href: "/shop?category=women" },
      { label: "Dresses & Silhouettes", href: "/shop?category=women" },
      { label: "Minimalist Knitwear", href: "/shop?category=women" },
      { label: "Architectural Outerwear", href: "/shop?category=women" },
      { label: "Relaxed Trousers", href: "/shop?category=women" }
    ],
    featured: {
      title: "The Feminine Silhouette",
      subtitle: "Clean drape & breathable fabrics",
      href: "/shop?category=women",
      image: "/elaris-women.jpg"
    }
  },
  Men: {
    title: "Men's Capsule",
    categories: [
      { label: "View All Men's", href: "/shop?category=men" },
      { label: "Heavyweight Fleece", href: "/shop?category=men" },
      { label: "Boxy Relaxed Tees", href: "/shop?category=men" },
      { label: "Structured Overshirts", href: "/shop?category=men" },
      { label: "Everyday Tailoring", href: "/shop?category=men" }
    ],
    featured: {
      title: "Urban Architecture",
      subtitle: "Structured essentials designed to endure",
      href: "/shop?category=men",
      image: "/elaris-men.jpg"
    }
  }
};

function isNavItemActive(href: string, label: string, pathname: string, categoryParam: string | null) {
  if (href.includes("?category=")) {
    const targetCategory = href.split("?category=")[1];
    return pathname === "/shop" && categoryParam?.toLowerCase() === targetCategory.toLowerCase();
  }

  if (href === "/shop" && label === "Shop") {
    return (pathname === "/shop" && (!categoryParam || categoryParam === "all")) || pathname.startsWith("/products");
  }

  if (href !== "/" && href !== "/shop") {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return false;
}

function HeaderNavLinks({
  activeMega,
  onHoverItem,
  onLeaveItem
}: {
  activeMega: string | null;
  onHoverItem: (label: string) => void;
  onLeaveItem: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  return (
    <nav
      className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.12em] md:flex"
      aria-label="Main Navigation"
    >
      {navItems.map(([label, href]) => {
        const isActive = isNavItemActive(href, label, pathname, categoryParam);
        const hasMega = label in megaMenuData;

        return (
          <div
            key={label}
            className="relative py-4"
            onMouseEnter={() => hasMega && onHoverItem(label)}
            onMouseLeave={onLeaveItem}
          >
            <Link
              href={href}
              className={`relative py-1 transition-colors duration-200 ${
                isActive || activeMega === label
                  ? "text-foreground font-bold"
                  : "text-foreground/75 hover:text-foreground"
              }`}
            >
              <span>{label}</span>
              {isActive && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-foreground rounded-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

function MobileNavLinks({ onSelect }: { onSelect: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  return (
    <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
      {navItems.map(([label, href]) => {
        const isActive = isNavItemActive(href, label, pathname, categoryParam);
        return (
          <Link
            key={label}
            href={href}
            onClick={onSelect}
            className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold tracking-wide transition-colors ${
              isActive
                ? "bg-muted text-foreground font-bold border-l-2 border-foreground"
                : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <span>{label}</span>
            <ArrowRight size={14} className="text-muted-foreground/60" />
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeMega, setActiveMega] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMega(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMega(null);
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border transition-all"
      role="banner"
      aria-label="Site navigation"
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      <div className="container-shell relative flex h-[68px] items-center justify-between gap-4">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Brand Logo with Editorial Serif Typography */}
        <div className="flex items-center">
          <Link
            href="/"
            className="font-serif text-2xl sm:text-[27px] font-bold tracking-[0.2em] uppercase text-foreground hover:opacity-85 transition-opacity"
            aria-label="ELARIS Home"
          >
            ELARIS
          </Link>
        </div>

        {/* Center Desktop Navigation */}
        <Suspense
          fallback={
            <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80 md:flex">
              {navItems.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="py-1 text-foreground/80 hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          }
        >
          <HeaderNavLinks
            activeMega={activeMega}
            onHoverItem={handleMouseEnter}
            onLeaveItem={handleMouseLeave}
          />
        </Suspense>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search with autocomplete — desktop */}
          <SearchAutocomplete
            placeholder="Search collections..."
            className="relative hidden lg:block w-60 xl:w-72"
          />

          {/* Search trigger for mobile / tablet */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors lg:hidden"
          >
            <Search size={18} />
          </Link>

          {/* Account */}
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <UserRound size={18} />
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label={`Wishlist (${wishlistItems.length} items)`}
            className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <Heart size={18} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background shadow-sm">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Shopping Bag */}
          <button
            type="button"
            aria-label={`Cart (${itemCount} items)`}
            onClick={openDrawer}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background shadow-sm">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Mega-Menu Panel */}
      {activeMega && megaMenuData[activeMega] && (
        <div
          className="absolute top-full left-0 right-0 z-50 border-b border-border bg-background/98 backdrop-blur-xl shadow-luxury animate-in fade-in-0 duration-200"
          onMouseEnter={() => handleMouseEnter(activeMega)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container-shell py-8">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Category Quicklinks */}
              <div className="col-span-4 space-y-4 pr-6 border-r border-border/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {megaMenuData[activeMega].title}
                </p>
                <ul className="space-y-2.5">
                  {megaMenuData[activeMega].categories.map((cat) => (
                    <li key={cat.label}>
                      <Link
                        href={cat.href}
                        onClick={() => setActiveMega(null)}
                        className="group flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-150">
                          {cat.label}
                        </span>
                        <ArrowRight
                          size={13}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-700"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curated Editorial Teaser */}
              <div className="col-span-8">
                <Link
                  href={megaMenuData[activeMega].featured.href}
                  onClick={() => setActiveMega(null)}
                  className="group relative block aspect-[21/9] overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={megaMenuData[activeMega].featured.image}
                    alt={megaMenuData[activeMega].featured.title}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                      Curated Editorial
                    </span>
                    <h3 className="font-serif text-xl font-bold tracking-tight">
                      {megaMenuData[activeMega].featured.title}
                    </h3>
                    <p className="text-xs text-white/80 max-w-md">
                      {megaMenuData[activeMega].featured.subtitle}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-5 md:hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <SearchAutocomplete placeholder="Search collections..." className="relative mb-5" />

          <Suspense
            fallback={
              <nav className="flex flex-col gap-2">
                {navItems.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3.5 py-2 text-sm font-medium hover:bg-muted text-foreground/80"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            }
          >
            <MobileNavLinks onSelect={() => setMobileMenuOpen(false)} />
          </Suspense>

          {/* Account quick-links in mobile drawer */}
          <div className="mt-5 pt-4 border-t border-border/80 flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-foreground/80 hover:bg-muted transition-colors"
            >
              <UserRound size={17} />
              <span>My Account</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-foreground/80 hover:bg-muted transition-colors"
            >
              <Heart size={17} />
              <span>Wishlist{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""}</span>
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-foreground/80 hover:bg-muted transition-colors"
            >
              <ShoppingBag size={17} />
              <span>Bag{itemCount > 0 ? ` (${itemCount})` : ""}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
