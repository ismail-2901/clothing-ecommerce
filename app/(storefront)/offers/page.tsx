import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { getCatalogHighlights } from "@/features/catalog/data";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers & Discounts – Atelier Commerce",
  description: "Browse active offers and coupon codes at Atelier Commerce."
};

export default function OffersPage() {
  const { offers } = getCatalogHighlights();

  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Offers
      </p>
      <h1 className="mt-2 text-4xl font-semibold">Active offers</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground max-w-xl">
        Apply the coupon code at checkout. Discounts are calculated server-side — the amount you see at checkout is always the correct final price.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {offers.map((offer) => (
          <article
            key={offer.code}
            className="relative rounded-lg border border-border bg-background p-6 overflow-hidden"
          >
            {/* Decorative stripe */}
            <div className="absolute inset-y-0 left-0 w-1 bg-foreground" />
            <div className="pl-4">
              <div className="flex items-center gap-2">
                <Tag size={18} />
                <h2 className="text-lg font-semibold">{offer.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {offer.summary}
              </p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="rounded-sm border border-border bg-muted px-4 py-2.5 font-mono text-sm font-semibold tracking-wider">
                  {offer.code}
                </div>
                <p className="text-xs text-muted-foreground">Apply at checkout</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-14">
        <h2 className="text-xl font-semibold">How to use a discount code</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["1. Browse and add", "Find the products you love and add them to your cart."],
            ["2. Enter code at checkout", "In your cart or at checkout, enter the coupon code in the promo field."],
            ["3. Confirm discount", "The discount is applied automatically. The final total shown is what you pay."]
          ].map(([title, copy]) => (
            <div key={title as string} className="rounded-lg border border-border p-5">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href="/shop">
            Shop the collection <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
