"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";

type CouponItem = {
  id: string;
  code: string;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minSubtotal: number | null;
  usageLimit: number | null;
  usageCount: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  endsAt: Date | string | null;
};

export function AdminOffersManager({
  initialCoupons,
}: {
  initialCoupons: CouponItem[];
}) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING">("PERCENTAGE");
  const [value, setValue] = useState<number | "">("");
  const [minSubtotal, setMinSubtotal] = useState<number | "">("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          type,
          value: type === "FREE_SHIPPING" ? 0 : Number(value) || 0,
          minSubtotal: minSubtotal ? Number(minSubtotal) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          endsAt: endsAt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create coupon.");
        setLoading(false);
        return;
      }

      setCode("");
      setTitle("");
      setValue("");
      setMinSubtotal("");
      setUsageLimit("");
      setEndsAt("");
      setShowAddModal(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Network error occurred.");
      setLoading(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingId(id);

    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to toggle offer status.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, couponCode: string) {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete coupon.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Offers & Discounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promotional coupons, free shipping rules, and cart discounts
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Offer
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Coupon Offer</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 grid gap-4">
              {error && (
                <div className="rounded border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-10 rounded-md border border-border bg-background px-3 font-mono text-sm uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% Off Summer Launch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Discount Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%) Discount</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (৳ Taka)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>

              {type !== "FREE_SHIPPING" && (
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">
                    {type === "PERCENTAGE" ? "Discount Percentage (%) *" : "Discount Amount (BDT) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === "PERCENTAGE" ? 100 : 100000}
                    placeholder={type === "PERCENTAGE" ? "20" : "500"}
                    value={value}
                    onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">Min. Order (BDT)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Save Offer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {initialCoupons.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <Megaphone size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No active offers</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create coupon codes to offer percent discounts or free delivery to boost conversions.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4">
            <Plus size={16} /> Create First Offer
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {initialCoupons.map((offer) => {
            const isActive = offer.status === "ACTIVE";
            const expiresDate = offer.endsAt ? new Date(offer.endsAt).toLocaleDateString("en-BD") : null;

            return (
              <div key={offer.id} className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-sm border border-border px-3 py-2 font-mono text-sm font-semibold bg-muted/30">
                      {offer.code}
                    </span>
                    <div>
                      <p className="font-semibold">{offer.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.type === "PERCENTAGE" && `${offer.value}% off`}
                        {offer.type === "FIXED_AMOUNT" && `${formatMoney(offer.value * 100)} off`}
                        {offer.type === "FREE_SHIPPING" && "Free shipping"}
                        {offer.minSubtotal ? ` · min. order ${formatMoney(offer.minSubtotal)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "success" : "muted"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    {expiresDate && (
                      <span className="text-xs text-muted-foreground">Expires {expiresDate}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                  <div className="flex gap-5">
                    <div>
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="mt-0.5 font-semibold">
                        {offer.usageCount}
                        {offer.usageLimit ? ` / ${offer.usageLimit}` : ""}
                      </p>
                    </div>
                    {offer.usageLimit && (
                      <div className="w-24">
                        <p className="text-xs text-muted-foreground">Usage</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{
                              width: `${Math.min((offer.usageCount / offer.usageLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={togglingId === offer.id}
                      onClick={() => handleToggleStatus(offer.id, offer.status)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
                    >
                      {togglingId === offer.id ? "Updating..." : isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === offer.id}
                      onClick={() => handleDelete(offer.id, offer.code)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
