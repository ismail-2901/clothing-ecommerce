export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminAbandonedCartsManager } from "@/components/admin/admin-abandoned-carts-manager";

export default async function AdminAbandonedCheckoutsPage() {
  const checkouts = await prisma.abandonedCheckout.findMany({
    orderBy: { lastActivity: "desc" },
    include: {
      cart: {
        include: {
          items: {
            include: {
              variant: {
                include: { product: { select: { name: true } } }
              }
            }
          },
          user: { select: { name: true, email: true } }
        }
      }
    },
    take: 50
  });

  const abandonedCarts = checkouts.map((c) => {
    const user = c.cart?.user;
    const customer = user?.name || (c.userId ? `User #${c.userId.slice(0, 6)}` : `Guest (${(c.sessionId || "anonymous").slice(0, 8)})`);
    const email = user?.email || null;
    const items = (c.cart?.items ?? []).map(
      (i) => `${i.variant.product.name} (${i.variant.color} / ${i.variant.size}) × ${i.quantity}`
    );

    return {
      id: c.id,
      customer,
      email,
      stage: c.stage,
      items: items.length > 0 ? items : ["Elaris Minimalist Apparel (In Cart)"],
      value: c.cartValue,
      lastSeen: new Date(c.lastActivity).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      recovered: false
    };
  });

  return <AdminAbandonedCartsManager checkouts={abandonedCarts} />;
}
