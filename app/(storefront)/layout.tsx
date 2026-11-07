import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { FloatingAssistantLazy } from "@/components/ai/floating-assistant-lazy";
import { getCachedCategories } from "@/lib/cache/db-cache";

// SSR session fetch removed — it called await headers() which forced
// Cache-Control: no-store on every page, breaking bfcache.
// WishlistProvider handles client-side sync: reads localStorage for guests,
// fetches /api/wishlist on mount for authenticated users.
export default async function StorefrontLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCachedCategories();

  return (
    <CartProvider>
      <WishlistProvider>
        <SiteHeader initialCategories={categories} />
        <main>{children}</main>
        <Footer />
        <FloatingAssistantLazy />
        {/* Cart drawer — always mounted, slides in on openDrawer() */}
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
