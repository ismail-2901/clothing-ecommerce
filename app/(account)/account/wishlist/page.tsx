export const dynamic = "force-dynamic";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Replace with DB query after migration is active.
const mockWishlist: Array<{ id: string; slug: string; name: string; price: number; imageUrl: string }> = [];

export default function AccountWishlistPage() {
  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Wishlist</h1>

      {mockWishlist.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Heart size={40} className="text-muted-foreground" />
          <p className="text-lg font-semibold">Nothing saved yet</p>
          <p className="text-sm text-muted-foreground">
            Products you heart will appear here.
          </p>
          <Link href="/shop" className="mt-2">
            <Button>Browse collection</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockWishlist.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-background p-4">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-muted" />
              <div className="mt-3">
                <p className="text-sm font-semibold">{item.name}</p>
                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/products/${item.slug}`}>View</Link>
                  </Button>
                  <Button size="sm">
                    <ShoppingBag size={14} /> Add to cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
