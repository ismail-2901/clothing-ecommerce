export const dynamic = "force-dynamic";
import { ShoppingCart, Clock, Package } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { Badge } from "@/components/ui/badge";

const abandonedCarts = [
  {
    id: "ab_1",
    customer: "Guest (session-a1b2)",
    email: null,
    stage: "PAYMENT",
    items: ["Black Linen Shirt / M", "Sculpted Black Dress / S"],
    value: 640000,
    lastSeen: "2024-12-15 14:32",
    device: "Mobile"
  },
  {
    id: "ab_2",
    customer: "Sadia Islam",
    email: "sadia@example.com",
    stage: "ADDRESS",
    items: ["Oversized Cotton Tee / M"],
    value: 145000,
    lastSeen: "2024-12-14 19:05",
    device: "Desktop"
  },
  {
    id: "ab_3",
    customer: "Guest (session-c3d4)",
    email: null,
    stage: "SHIPPING",
    items: ["Tailored Trouser / L", "Black Linen Shirt / S"],
    value: 520000,
    lastSeen: "2024-12-14 11:20",
    device: "Mobile"
  }
];

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

export default function AdminAbandonedCheckoutsPage() {
  const totalValue = abandonedCarts.reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Abandoned Checkouts</h1>
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
            <p className="text-sm text-muted-foreground">Abandonment rate</p>
            <Clock size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">33%</p>
          <p className="mt-1 text-xs text-muted-foreground">Checkout started → order placed</p>
        </div>
      </div>

      {/* Funnel breakdown */}
      <div className="mt-6 rounded-lg border border-border bg-background p-5">
        <h2 className="font-semibold">Abandonment by stage</h2>
        <div className="mt-4 grid gap-3">
          {[
            { stage: "At payment", count: 1 },
            { stage: "At shipping", count: 1 },
            { stage: "At address", count: 1 },
          ].map(({ stage, count }) => (
            <div key={stage} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stage}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cart list */}
      <div className="mt-6 grid gap-4">
        {abandonedCarts.sort((a, b) => stageOrder[b.stage] - stageOrder[a.stage]).map((cart) => (
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
                <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  Send recovery email
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
