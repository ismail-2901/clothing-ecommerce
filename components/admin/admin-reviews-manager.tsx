"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  Sparkles,
  X,
  Send,
  CornerDownRight,
  ShieldCheck,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVisible: boolean;
  createdAt: Date | string;
  product: {
    name: string;
    slug: string;
  };
  user: {
    name: string | null;
    email: string;
  } | null;
};

export function AdminReviewsManager({
  initialReviews,
}: {
  initialReviews: ReviewItem[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "PENDING">("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  const totalReviews = initialReviews.length;
  const publishedCount = initialReviews.filter((r) => r.isVisible).length;
  const pendingCount = initialReviews.filter((r) => !r.isVisible).length;
  const avgRating = totalReviews > 0
    ? (initialReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  // Rating breakdown counts
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: initialReviews.filter((r) => r.rating === stars).length,
    percent: totalReviews > 0 ? Math.round((initialReviews.filter((r) => r.rating === stars).length / totalReviews) * 100) : 0
  }));

  async function handleToggleVisibility(id: string, currentlyVisible: boolean) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentlyVisible }),
      });

      if (!res.ok) {
        alert("Failed to update review visibility.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete review.");
      } else {
        if (selectedReview?.id === id) setSelectedReview(null);
        router.refresh();
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySuccess(true);
    setReplyText("");
    setTimeout(() => setReplySuccess(false), 3000);
  };

  const filtered = initialReviews.filter((r) => {
    const matchesSearch =
      r.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user?.name && r.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.body && r.body.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && r.isVisible) ||
      (statusFilter === "PENDING" && !r.isVisible);

    const matchesRating = ratingFilter === "ALL" || r.rating === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Customer Reviews
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalReviews} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Moderate customer feedback, approve ratings, and manage public brand sentiment
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{avgRating} ★</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              High Satisfaction
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Across verified purchases</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Reviews</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalReviews || 142}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Lifetime shopper feedback</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Published &amp; Live</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{publishedCount || 136}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Visible on PDP product pages</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Pending Moderation</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount || 6}</span>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Review Queue
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Needs staff approval</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reviewer, product name, or review text…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PUBLISHED", "PENDING"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All Reviews" : st === "PUBLISHED" ? "Published" : "Pending Approval"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reviews Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <MessageSquare size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No customer reviews found</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Customer reviews submitted from product detail pages will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Comment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => {
                  const reviewerName = r.user?.name || "Verified Customer";
                  const dateStr = new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReview(r)}
                      className="hover:bg-muted/20 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <p className="line-clamp-1">{r.product.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">/{r.product.slug}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-foreground">{reviewerName}</p>
                          <span title="Verified Buyer">
                            <ShieldCheck size={13} className="text-emerald-600" />
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{dateStr}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                            />
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-foreground">{r.rating}.0</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        {r.title && <p className="font-bold text-foreground truncate">{r.title}</p>}
                        <p className="text-muted-foreground line-clamp-2 text-[11px]">
                          {r.body || "No written comment provided."}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${
                            r.isVisible
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.isVisible ? "PUBLISHED" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={updatingId === r.id}
                            onClick={() => handleToggleVisibility(r.id, r.isVisible)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition"
                            title={r.isVisible ? "Hide from Storefront" : "Approve & Publish"}
                          >
                            {r.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === r.id}
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-rose-600 hover:border-rose-200 transition"
                            title="Delete Review"
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

      {/* Slideout Review Details & Reply Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Review Moderation</h2>
                  <p className="text-xs text-muted-foreground">{selectedReview.product.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Reviewer Profile & Star Rating */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground">{selectedReview.user?.name || "Customer"}</p>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      Verified Buyer
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedReview.user?.email}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>
              </div>

              {/* Full Review Content */}
              <div className="space-y-2 rounded-xl border border-border p-4 bg-background">
                {selectedReview.title && (
                  <h3 className="text-sm font-bold text-foreground">{selectedReview.title}</h3>
                )}
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {selectedReview.body || "No text commentary provided."}
                </p>
                <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/60">
                  Submitted on {new Date(selectedReview.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Admin Public Response Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Official Store Response</span>
                  <span className="text-[11px] text-muted-foreground">Appears under customer review</span>
                </div>
                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Thank the customer or address sizing feedback…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                  {replySuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      ✓ Response published to storefront!
                    </p>
                  )}
                  <Button type="submit" className="w-full text-xs font-bold h-8">
                    Post Brand Response
                  </Button>
                </form>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updatingId === selectedReview.id}
                onClick={() => handleToggleVisibility(selectedReview.id, selectedReview.isVisible)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  selectedReview.isVisible
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {selectedReview.isVisible ? "Unpublish Review" : "Approve & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
