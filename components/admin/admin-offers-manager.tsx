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
  Clock,
  Edit2,
  AlertCircle,
  Truck,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";

export type CouponItem = {
  id: string;
  code: string;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minSubtotal: number | null; // in poisha
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

  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING">("PERCENTAGE");
  const [value, setValue] = useState<number | "">("");
  const [minSubtotal, setMinSubtotal] = useState<number | "">("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [endsAt, setEndsAt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMinSubtotal, setEditMinSubtotal] = useState<number | "">("");
  const [editUsageLimit, setEditUsageLimit] = useState<number | "">("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Actions
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<CouponItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeCount = initialCoupons.filter((c) => c.status === "ACTIVE").length;
  const totalRedemptions = initialCoupons.reduce((sum, c) => sum + c.usageCount, 0);

  const now = new Date();
  const expiringThisMonthCount = initialCoupons.filter((c) => {
    if (!c.endsAt) return false;
    const end = new Date(c.endsAt);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return end >= now && end <= thirtyDaysFromNow;
  }).length;

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

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
        setCreateError(data.error || "Failed to create coupon.");
        setCreateLoading(false);
        return;
      }

      setCode("");
      setTitle("");
      setValue("");
      setMinSubtotal("");
      setUsageLimit("");
      setEndsAt("");
      setShowAddModal(false);
      setCreateLoading(false);
      router.refresh();
    } catch {
      setCreateError("Network error occurred.");
      setCreateLoading(false);
    }
  }

  function startEdit(coupon: CouponItem) {
    setEditingCoupon(coupon);
    setEditTitle(coupon.title);
    setEditMinSubtotal(coupon.minSubtotal ? Math.round(coupon.minSubtotal / 100) : "");
    setEditUsageLimit(coupon.usageLimit ?? "");
    setEditEndsAt(
      coupon.endsAt
        ? new Date(coupon.endsAt).toISOString().slice(0, 10)
        : ""
    );
    setEditStatus(coupon.status === "ACTIVE" ? "ACTIVE" : "INACTIVE");
    setEditError(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCoupon) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/admin/offers/${editingCoupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          status: editStatus,
          minSubtotal: editMinSubtotal !== "" ? Number(editMinSubtotal) : null,
          usageLimit: editUsageLimit !== "" ? Number(editUsageLimit) : null,
          endsAt: editEndsAt || null
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update coupon.");
        setEditLoading(false);
        return;
      }

      setEditingCoupon(null);
      setEditLoading(false);
      router.refresh();
    } catch {
      setEditError("Network error occurred.");
      setEditLoading(false);
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

  async function handleConfirmDelete() {
    if (!deletingCoupon) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/offers/${deletingCoupon.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete promotion.");
      }
      setDeletingCoupon(null);
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredCoupons = initialCoupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());

    const isExpired = c.endsAt ? new Date(c.endsAt) < now : false;

    if (statusFilter === "ACTIVE") return matchesSearch && c.status === "ACTIVE" && !isExpired;
    if (statusFilter === "INACTIVE") return matchesSearch && c.status === "INACTIVE";
    if (statusFilter === "EXPIRED") return matchesSearch && isExpired;
    return matchesSearch;
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
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground dark:text-white">
              {initialCoupons.length} Campaigns
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure discount codes, manage percentage off thresholds, free shipping rules, and track usage
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
          <p className="mt-1 text-[11px] text-muted-foreground">Claimable in checkout</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Redemptions</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalRedemptions}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Discounted customer orders</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Expiring Soon (30d)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {expiringThisMonthCount}
            </span>
            {expiringThisMonthCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Review
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Approaching deadline</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Free Shipping Rules</p>
          <p className="mt-2 text-2xl font-black text-foreground">
            {initialCoupons.filter((c) => c.type === "FREE_SHIPPING").length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Zero-delivery campaigns</p>
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Expired", value: "EXPIRED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
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
            {searchTerm || statusFilter !== "ALL"
              ? "No campaigns matched your current search or status filter."
              : "Create coupon discounts to drive conversions and reward loyal customers."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {(searchTerm || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
            <Button onClick={() => setShowAddModal(true)} className="text-xs">
              <Plus size={14} /> Create Promotion
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground h-11">
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
                  const isExpired = c.endsAt ? new Date(c.endsAt) < now : false;
                  const usagePercent = c.usageLimit
                    ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100))
                    : 0;

                  return (
                    <tr key={c.id} className="h-11 hover:bg-muted/20 transition">
                      <td className="py-2.5 px-4 font-mono font-bold">
                        <div className="inline-flex items-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 border border-border">
                          <span className="text-foreground dark:text-white tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check size={11} className="text-emerald-600" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <p className="font-bold text-foreground line-clamp-1">{c.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {c.type.replace(/_/g, " ")}
                        </p>
                      </td>

                      <td className="py-2.5 px-4 font-extrabold text-foreground">
                        {c.type === "PERCENTAGE" ? (
                          <span className="text-emerald-600">{c.value}% OFF</span>
                        ) : c.type === "FIXED_AMOUNT" ? (
                          <span className="text-emerald-600">{formatMoney(c.value)} OFF</span>
                        ) : (
                          <span className="text-blue-600">Free Shipping</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex justify-between text-[11px] font-medium text-foreground">
                            <span>{c.usageCount} used</span>
                            {c.usageLimit && (
                              <span className="text-muted-foreground">of {c.usageLimit}</span>
                            )}
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

                      <td className="py-2.5 px-4 text-foreground">
                        {c.minSubtotal ? formatMoney(c.minSubtotal) : "No minimum"}
                      </td>

                      <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                        {c.endsAt ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar size={12} />
                            <span className={isExpired ? "text-rose-600 font-semibold" : ""}>
                              {new Date(c.endsAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          "No expiration"
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={togglingId === c.id}
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                            isExpired
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="rounded p-1 text-muted-foreground hover:text-foreground transition"
                            title="Edit Promotion"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCoupon(c)}
                            className="rounded p-1 text-muted-foreground hover:text-rose-600 transition"
                            title="Delete Promotion"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Create New Promotion</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Set discount parameters, eligibility limits, and promo code
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {createError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Collection 20% Off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                {type !== "FREE_SHIPPING" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
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
                      className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Min Spend (৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional (e.g. 2000)"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Optional (e.g. 100)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Expiration Date</label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Live Preview Pill */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs space-y-1">
                <p className="font-semibold text-zinc-700">Shopper Preview:</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-300">
                    {code || "PROMOCODE"}
                  </span>
                  <span className="text-zinc-600 font-medium">
                    {type === "PERCENTAGE"
                      ? `${value || 0}% off entire order`
                      : type === "FIXED_AMOUNT"
                      ? `৳${value || 0} discount`
                      : "Free standard delivery"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={createLoading} className="text-xs font-bold">
                  {createLoading ? <Spinner size="sm" /> : "Publish Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Edit Promotion: {editingCoupon.code}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update campaign parameters and status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {editError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {editError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Campaign Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus("ACTIVE")}
                    className={`rounded-lg border py-2 text-xs font-bold transition ${
                      editStatus === "ACTIVE"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("INACTIVE")}
                    className={`rounded-lg border py-2 text-xs font-bold transition ${
                      editStatus === "INACTIVE"
                        ? "border-zinc-500 bg-zinc-100 text-zinc-800"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    INACTIVE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Min Spend (৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="None"
                    value={editMinSubtotal}
                    onChange={(e) => setEditMinSubtotal(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="None"
                    value={editUsageLimit}
                    onChange={(e) => setEditUsageLimit(e.target.value ? Number(e.target.value) : "")}
                    className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Expiration Date</label>
                <input
                  type="date"
                  value={editEndsAt}
                  onChange={(e) => setEditEndsAt(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  disabled={editLoading}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={editLoading} className="text-xs font-bold">
                  {editLoading ? <Spinner size="sm" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-zinc-900 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-50 p-2 text-rose-600 border border-rose-200">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Delete Promotion</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Are you sure you want to delete coupon code{" "}
                  <strong className="text-zinc-900 font-mono">&quot;{deletingCoupon.code}&quot;</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              This will archive the promotion. Shoppers will no longer be able to claim this code.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                disabled={isDeleting}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-xs"
              >
                {isDeleting ? <Spinner size="sm" /> : <Trash2 size={13} />}
                <span>Delete Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
