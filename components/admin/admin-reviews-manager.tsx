"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

export function AdminReviewsManager({
  initialReviews,
}: {
  initialReviews: ReviewItem[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "PENDING">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = initialReviews.filter((r) => {
    if (filter === "PUBLISHED") return r.isVisible;
    if (filter === "PENDING") return !r.isVisible;
    return true;
  });

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
        router.refresh();
      }
    } catch {
      alert("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate customer product feedback and ratings
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {[
          { label: "All", value: "ALL" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Pending Moderation", value: "PENDING" },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value as typeof filter)}
            className={`rounded-md px-3 py-1.5 transition ${
              filter === f.value
                ? "bg-foreground text-background"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <Star size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No reviews found</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Customer product reviews will show up here for admin moderation.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((review) => {
            const customerName = review.user?.name || review.user?.email || "Customer";
            const dateStr = new Date(review.createdAt).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <article key={review.id} className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{review.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customerName} · {dateStr}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={review.isVisible ? "success" : "warning"}>
                      {review.isVisible ? "Published" : "Pending Moderation"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3">
                  <StarRating rating={review.rating} />
                  {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {review.body || "No comment provided."}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    disabled={updatingId === review.id}
                    onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      review.isVisible
                        ? "border border-border hover:bg-muted"
                        : "bg-foreground text-background hover:bg-zinc-800"
                    }`}
                  >
                    {updatingId === review.id
                      ? "Updating..."
                      : review.isVisible
                        ? "Hide Review"
                        : "Publish Review"}
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === review.id}
                    onClick={() => handleDelete(review.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
