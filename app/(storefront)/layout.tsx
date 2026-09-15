import { FloatingAssistant } from "@/components/ai/floating-assistant";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getServerSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

async function getWishlistProductIds(userId: string): Promise<string[]> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { items: { select: { productId: true } } }
  });
  return (wishlist?.items ?? []).map((i) => i.productId);
}

export default async function StorefrontLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  const serverProductIds = session?.userId
    ? await getWishlistProductIds(session.userId)
    : undefined;

  return (
    <CartProvider>
      <WishlistProvider serverProductIds={serverProductIds}>
        <SiteHeader />
        <main>{children}</main>
        <Footer />
        <FloatingAssistant />
      </WishlistProvider>
    </CartProvider>
  );
}
