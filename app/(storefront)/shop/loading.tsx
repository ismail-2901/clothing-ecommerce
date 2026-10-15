// loading.tsx for the /shop route — shown while the Server Component fetches
// products, categories, and total count from the DB.

export default function ShopLoading() {
  return (
    <div className="container-shell py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-3 w-64 rounded bg-muted" />
      </div>

      {/* Banner skeleton */}
      <div className="h-40 rounded-2xl bg-muted" />

      {/* Filters + grid */}
      <div className="lg:grid lg:gap-10 lg:grid-cols-[240px_1fr] items-start">
        {/* Sidebar skeleton (desktop only) */}
        <div className="hidden lg:flex flex-col gap-4">
          {[120, 80, 100, 60].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className={`h-3 w-${w < 90 ? "16" : "20"} rounded bg-muted`} />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-8 rounded-md bg-muted" />
              ))}
            </div>
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] rounded-lg bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
