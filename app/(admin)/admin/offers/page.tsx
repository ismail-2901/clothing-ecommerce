export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const offers = [
  {
    id: "off_1",
    title: "Launch 10% off",
    type: "PERCENTAGE",
    value: 10,
    code: "LAUNCH10",
    scope: "CART",
    minOrder: 0,
    usageLimit: 500,
    used: 48,
    active: true,
    expires: "2024-12-31"
  },
  {
    id: "off_2",
    title: "Free shipping over ৳2,000",
    type: "FREE_SHIPPING",
    value: 0,
    code: "SHIPFREE",
    scope: "CART",
    minOrder: 200000,
    usageLimit: null,
    used: 112,
    active: true,
    expires: null
  },
  {
    id: "off_3",
    title: "First order ৳500 off",
    type: "FIXED_AMOUNT",
    value: 50000,
    code: "FIRST500",
    scope: "CART",
    minOrder: 100000,
    usageLimit: 1000,
    used: 201,
    active: false,
    expires: "2024-11-30"
  }
];

export default function AdminOffersPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Offers & Discounts</h1>
        </div>
        <Button>
          <Plus size={16} /> Create offer
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-border bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-sm border border-border px-3 py-2 font-mono text-sm font-semibold">
                  {offer.code}
                </span>
                <div>
                  <p className="font-semibold">{offer.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {offer.type === "PERCENTAGE" && `${offer.value}% off`}
                    {offer.type === "FIXED_AMOUNT" && `${formatMoney(offer.value)} off`}
                    {offer.type === "FREE_SHIPPING" && "Free shipping"}
                    {offer.minOrder > 0 && ` · min. order ${formatMoney(offer.minOrder)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={offer.active ? "success" : "muted"}>
                  {offer.active ? "Active" : "Inactive"}
                </Badge>
                {offer.expires && (
                  <span className="text-xs text-muted-foreground">Expires {offer.expires}</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
              <div className="flex gap-5">
                <div>
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="mt-0.5 font-semibold">{offer.used}{offer.usageLimit ? ` / ${offer.usageLimit}` : ""}</p>
                </div>
                {offer.usageLimit && (
                  <div className="w-24">
                    <p className="text-xs text-muted-foreground">Usage</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${Math.min((offer.used / offer.usageLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  {offer.active ? "Pause" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
