import { returnPolicy } from "@/features/content/policies";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds – Elaris",
  description: "Our 14-day return window, exchange and refund process."
};

export default function ReturnsPage() {
  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Help
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{returnPolicy.title}</h1>

      <div className="mt-8 grid gap-8">
        {returnPolicy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/40 p-5">
        <p className="text-sm font-semibold">Start a return</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Signed-in customers can start a return directly from Account → Orders.
        </p>
        <Link
          href="/account/orders"
          className="mt-3 inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:bg-zinc-800 transition"
        >
          Go to my orders
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/faq" className="font-semibold underline underline-offset-4">View FAQ</Link>
        <Link href="/contact" className="font-semibold underline underline-offset-4">Contact support</Link>
      </div>
    </div>
  );
}
