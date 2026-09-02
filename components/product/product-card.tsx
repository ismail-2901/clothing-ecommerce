import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/features/catalog/data";
import { formatMoney } from "@/lib/utils/money";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const variant = product.variants[0];

  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted"
      >
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
        {variant.compareAtPrice ? (
          <span className="absolute left-3 top-3 rounded-sm bg-background px-2 py-1 text-xs font-semibold">
            Offer
          </span>
        ) : null}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold">{formatMoney(variant.price)}</span>
            {variant.compareAtPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatMoney(variant.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex gap-1">
            {[...new Set(product.variants.map((item) => item.color))].map((color) => (
              <span
                key={color}
                className="h-4 w-4 rounded-full border border-border bg-foreground"
                title={color}
              />
            ))}
          </div>
        </div>
        <WishlistButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={variant.price}
          image={product.images[0]?.src}
        />
      </div>
    </article>
  );
}

