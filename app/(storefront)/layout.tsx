import { FloatingAssistant } from "@/components/ai/floating-assistant";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";

export default function StorefrontLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SiteHeader />
        <main>{children}</main>
        <Footer />
        <FloatingAssistant />
      </WishlistProvider>
    </CartProvider>
  );
}

