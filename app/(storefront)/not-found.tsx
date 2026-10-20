import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center gap-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        Page Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Sorry, we couldn&apos;t find the page you were looking for. It may have been moved or removed.
      </p>
      <Link
        href="/shop"
        className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-6 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
      >
        Continue Shopping
      </Link>
      <Link href="/" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Back to Home
      </Link>
    </div>
  );
}
