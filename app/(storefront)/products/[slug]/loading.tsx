// loading.tsx for /products/[slug] — shown while generateMetadata and the page
// component fetch product data and reviews concurrently.

export default function ProductDetailLoading() {
  return (
    <div className="container-shell py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-3 w-2 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-3 w-2 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-[3/4] w-full rounded-xl bg-muted" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-md bg-muted" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-4 lg:pt-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted" />

          {/* Variants */}
          <div className="space-y-2 pt-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 w-9 rounded-full bg-muted" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 rounded bg-muted" />
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-14 rounded-md bg-muted" />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="h-12 rounded-lg bg-muted mt-4" />
          <div className="h-10 rounded-lg bg-muted" />

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
