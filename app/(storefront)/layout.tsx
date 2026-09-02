import { FloatingAssistant } from "@/components/ai/floating-assistant";
import { CartProvider } from "@/components/cart/cart-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";

export default function StorefrontLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <WishlistProvider>
        <AnnouncementBar />
        <SiteHeader />
        <main>{children}</main>
        <Footer />
        <FloatingAssistant />
      </WishlistProvider>
    </CartProvider>
  );
}

