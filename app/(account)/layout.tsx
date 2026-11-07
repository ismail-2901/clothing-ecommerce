import type { Metadata } from "next";
import { FloatingAssistant } from "@/components/ai/floating-assistant";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { getCachedCategories } from "@/lib/cache/db-cache";

export const metadata: Metadata = {
  title: "My Account – Elaris",
  robots: {
    index: false,
    follow: false
  }
};

async function getWishlistProductIds(userId: string): Promise<string[]> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { items: { select: { productId: true } } }
  });
  return (wishlist?.items ?? []).map((i) => i.productId);
}

export default async function AccountLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [session, categories] = await Promise.all([
    getServerSession(),
    getCachedCategories()
  ]);
  const serverProductIds = session?.userId
    ? await getWishlistProductIds(session.userId)
    : undefined;

  return (
    <CartProvider>
      <WishlistProvider serverProductIds={serverProductIds}>
        <SiteHeader initialCategories={categories} />
        <main>{children}</main>
        <Footer />
        <FloatingAssistant />
      </WishlistProvider>
    </CartProvider>
  );
}
