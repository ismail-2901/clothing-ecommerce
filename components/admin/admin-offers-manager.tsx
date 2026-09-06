"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Megaphone,
  X,
  Search,
  Tag,
  Copy,
  Check,
  Calendar,
  Percent,
  TrendingUp,
  Clock
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = initialCoupons.filter((c) => c.status === "ACTIVE").length;
  const totalRedemptions = initialCoupons.reduce((sum, c) => sum + c.usageCount, 0);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
    setTogglingId(id);
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        alert("Failed to update status.");
      }
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, promoCode: string) {
    if (!confirm(`Delete promotion code "${promoCode}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete promotion.");
      }
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCoupons = initialCoupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Offers &amp; Promotions
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {initialCoupons.length} Campaigns
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Create coupon codes, manage percentage discounts, and track promotional redemptions
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="text-xs h-8">
          <Plus size={14} /> Create Promotion
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Active Campaigns</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{activeCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Claimable on checkout</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Redemptions</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalRedemptions}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Shopper orders discounted</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Avg Discount Given</p>
          <p className="mt-2 text-2xl font-black text-foreground">৳480</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Per order savings</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Expiring This Month</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">2</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Review
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Campaigns near deadline</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search promo code, campaign title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "ACTIVE", "INACTIVE"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Offers Table */}
      {filteredCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <Megaphone size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No promotions found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Create coupon discounts to drive conversions and reward loyal customers.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4 text-xs">
            <Plus size={14} /> Create First Promotion
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Campaign Details</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Usage Limit</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCoupons.map((c) => {
                  const isActive = c.status === "ACTIVE";
                  const usagePercent = c.usageLimit ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100)) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <div className="inline-flex items-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 border border-border">
                          <span className="text-foreground tracking-wider">{c.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-foreground">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground uppercase">{c.type.replace(/_/g, " ")}</p>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-foreground">
                        {c.type === "PERCENTAGE" ? (
                          <span className="text-emerald-600">{c.value}% OFF</span>
                        ) : c.type === "FIXED_AMOUNT" ? (
                          <span className="text-emerald-600">{formatMoney(c.value)} OFF</span>
                        ) : (
                          <span className="text-blue-600">Free Shipping</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex justify-between text-[11px] font-medium text-foreground">
                            <span>{c.usageCount} used</span>
                            {c.usageLimit && <span className="text-muted-foreground">of {c.usageLimit}</span>}
                          </div>
                          {c.usageLimit && (
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-foreground rounded-full"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">
                        {c.minSubtotal ? formatMoney(c.minSubtotal) : "No minimum"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {c.endsAt ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar size={12} />
                            <span>{new Date(c.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        ) : (
                          "No expiration"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={togglingId === c.id}
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                            isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          onClick={() => handleDelete(c.id, c.code)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-200 transition"
                          title="Delete promotion"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Create New Promotion</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs text-foreground uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Collection 20% Off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                {type !== "FREE_SHIPPING" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {type === "PERCENTAGE" ? "Percentage (%)" : "Amount (৳)"} *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={type === "PERCENTAGE" ? 100 : 50000}
                      placeholder={type === "PERCENTAGE" ? "20" : "500"}
                      value={value}
                      onChange={(e) => setValue(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Min Spend (৳)</label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 2000)"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 100)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expiration Date</label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={loading} className="text-xs font-bold">
                  {loading ? <Spinner size="sm" /> : "Publish Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
