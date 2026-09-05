export const dynamic = "force-dynamic";

import { ShoppingCart, Clock, Package, UserX } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/db/prisma";

const stageOrder: Record<string, number> = {
  CART: 1, CONTACT: 2, ADDRESS: 3, SHIPPING: 4, PAYMENT: 5, REVIEW: 6
};

function stageBadge(stage: string) {
  const labels: Record<string, string> = {
    CART: "Cart", CONTACT: "Contact", ADDRESS: "Address",
    SHIPPING: "Shipping", PAYMENT: "Payment", REVIEW: "Review"
  };
  return <Badge variant="warning">{labels[stage] ?? stage}</Badge>;
}

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
      items: items.length > 0 ? items : ["Cart item details recorded"],
      value: c.cartValue,
      lastSeen: c.lastActivity.toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }),
      device: (c.metadata as Record<string, string>)?.device || "Web"
    };
  });

  const totalValue = abandonedCarts.reduce((s, c) => s + c.value, 0);

  // Group by stage
  const stageCounts: Record<string, number> = {};
  for (const c of abandonedCarts) {
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Abandoned Checkouts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track customer drop-offs and recover uncompleted carts
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Abandoned carts</p>
            <ShoppingCart size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{abandonedCarts.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Abandoned value</p>
            <Package size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{formatMoney(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Monitored Window</p>
            <Clock size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">Active</p>
          <p className="mt-1 text-xs text-muted-foreground">Synced from customer checkout sessions</p>
        </div>
      </div>

      {/* Funnel breakdown */}
      {abandonedCarts.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Abandonment by stage</h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(stageCounts).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">At {stage.toLowerCase()}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart list */}
      {abandonedCarts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <UserX size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No abandoned checkouts</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When visitors begin checkout but don&apos;t complete payment, session records will display here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {abandonedCarts
            .sort((a, b) => (stageOrder[b.stage] ?? 0) - (stageOrder[a.stage] ?? 0))
            .map((cart) => (
              <div key={cart.id} className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{cart.customer}</p>
                    {cart.email && (
                      <p className="text-sm text-muted-foreground">{cart.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {stageBadge(cart.stage)}
                    <span className="text-xs text-muted-foreground">{cart.device}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Items in cart:</p>
                  {cart.items.map((item) => (
                    <p key={item} className="text-sm">· {item}</p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                  <p>
                    Cart value: <strong>{formatMoney(cart.value)}</strong> · Last seen: {cart.lastSeen}
                  </p>
                  {cart.email && (
                    <a
                      href={`mailto:${cart.email}?subject=Did you forget something at ${process.env.NEXT_PUBLIC_BRAND_NAME || "Elaris"}?`}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      Send recovery email
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
