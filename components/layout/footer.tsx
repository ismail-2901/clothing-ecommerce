"use client";

import { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-background pt-14 pb-12 text-foreground">
      <div className="container-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr] items-start">
          {/* Brand & Tagline & Nav */}
          <div className="space-y-4">
            <div>
              <Link href="/" className="text-2xl font-black tracking-[0.16em] uppercase">
                ELARIS
              </Link>
              <p className="mt-1 text-xs text-muted-foreground tracking-wide">
                More Than Clothing.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-foreground/80">
              <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
              <Link href="/shop?category=women" className="hover:text-foreground transition-colors">Women</Link>
              <Link href="/shop?category=men" className="hover:text-foreground transition-colors">Men</Link>
              <Link href="/shop" className="hover:text-foreground transition-colors">Collections</Link>
              <Link href="/offers" className="hover:text-foreground transition-colors">Offers</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Newsletter & Socials & Script Tagline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="w-full max-w-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Join Our Community
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Be the first to know about new collections and exclusive offers.
              </p>
              {subscribed ? (
                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Thank you for subscribing to ELARIS.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-9 shrink-0 rounded-md bg-foreground px-5 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              {/* Social links */}
              <div className="mt-4 flex items-center gap-4 text-foreground/70">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Instagram">
                  <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Facebook">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="TikTok">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.91 1.63V6.87c-.34 0-.67-.06-1-.18z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="YouTube">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Script signature */}
            <div className="hidden lg:flex items-center pl-6 border-l border-border">
              <span className="font-serif italic text-2xl xl:text-3xl text-foreground/80 tracking-wide select-none">
                Wear<br />Your Story
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} ELARIS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/shipping" className="hover:underline">Shipping &amp; Delivery</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

