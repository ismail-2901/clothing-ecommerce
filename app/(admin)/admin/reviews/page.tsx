export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const reviews = [
  {
    id: "r1",
    product: "Black Linen Shirt",
    slug: "black-linen-shirt",
    customer: "Nusrat Rahman",
    rating: 5,
    comment: "Excellent quality and perfect fit. The linen fabric is breathable for hot weather.",
    date: "2024-12-10",
    verified: true,
    status: "PUBLISHED"
  },
  {
    id: "r2",
    product: "Sculpted Black Dress",
    slug: "sculpted-black-dress",
    customer: "Sadia Islam",
    rating: 4,
    comment: "Beautiful dress, great for formal events. Slightly runs small, order up.",
    date: "2024-12-05",
    verified: true,
    status: "PUBLISHED"
  },
  {
    id: "r3",
    product: "Oversized Cotton Tee",
    slug: "oversized-cotton-tee",
    customer: "Raihan Kabir",
    rating: 2,
    comment: "Shrunk after first wash. Disappointed with quality for the price.",
    date: "2024-12-12",
    verified: true,
    status: "PENDING"
  }
];

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

export default function AdminReviewsPage() {
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Reviews</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {["All", "Published", "Pending moderation", "Hidden"].map((f) => (
          <button key={f} type="button" className="rounded-sm border border-border px-3 py-1.5 hover:bg-muted">
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-border bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{review.product}</p>
                <p className="text-sm text-muted-foreground">{review.customer} · {review.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={review.status === "PUBLISHED" ? "success" : "warning"}>
                  {review.status.toLowerCase()}
                </Badge>
                {review.verified && <Badge variant="muted">Verified purchase</Badge>}
              </div>
            </div>
            <div className="mt-3">
              <StarRating rating={review.rating} />
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
            </div>
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              {review.status === "PENDING" && (
                <button type="button" className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-zinc-800">
                  Publish
                </button>
              )}
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
                Hide
              </button>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs text-danger hover:bg-muted">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
