export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { AdminAbandonedCartsManager, type AbandonedCheckoutItem } from "@/components/admin/admin-abandoned-carts-manager";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function AdminAbandonedCheckoutsPage() {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

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
          user: { select: { name: true, email: true, phone: true } }
        }
      }
    },
    take: 100
  });

  const abandonedCarts: AbandonedCheckoutItem[] = checkouts.map((c) => {
    const rawMeta = (c.metadata as Record<string, any>) || {};
    const user = c.cart?.user;
    const customer =
      user?.name ||
      rawMeta.customerName ||
      (c.userId ? `User #${c.userId.slice(0, 6)}` : `Guest (${(c.sessionId || "anon").slice(0, 8)})`);
    const email = user?.email || rawMeta.guestEmail || rawMeta.email || null;
    const phone = user?.phone || rawMeta.guestPhone || rawMeta.phone || null;

    const items = (c.cart?.items ?? []).map((i) => ({
      name: i.variant.product.name,
      variant: `${i.variant.color} / ${i.variant.size}`,
      quantity: i.quantity
    }));

    const lastRecoverySentAt = rawMeta.lastRecoverySentAt || null;
    const recoveryAttempts = Array.isArray(rawMeta.recoveryAttempts) ? rawMeta.recoveryAttempts : [];
    const recovered = rawMeta.recovered === true;

    return {
      id: c.id,
      cartId: c.cartId,
      customer,
      email,
      phone,
      stage: c.stage,
      items:
        items.length > 0
          ? items
          : [{ name: "Elaris Signature Apparel (In Bag)", variant: "Default", quantity: 1 }],
      value: c.cartValue,
      lastSeen: new Date(c.lastActivity).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      lastSeenRaw: c.lastActivity.toISOString(),
      recovered,
      lastRecoverySentAt,
      recoveryAttemptsCount: recoveryAttempts.length
    };
  });

  const channels = {
    email: {
      available: true,
      provider: process.env.EMAIL_PROVIDER || "console"
    },
    sms: {
      available: false,
      provider: "None (Unconfigured in ELARIS)"
    }
  };

  return <AdminAbandonedCartsManager checkouts={abandonedCarts} channels={channels} />;
}
