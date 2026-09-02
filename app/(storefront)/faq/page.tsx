import Link from "next/link";
import { faqItems } from "@/features/content/policies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – Atelier Commerce",
  description: "Answers to common questions about orders, delivery, returns, and products."
};

// Group by category
const grouped: Record<string, typeof faqItems> = {};
for (const item of faqItems) {
  const cat = item.category ?? "General";
  (grouped[cat] ??= []).push(item);
}

export default function FAQPage() {
  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Help
      </p>
      <h1 className="mt-2 text-4xl font-semibold">Frequently asked questions</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Can't find what you need?{" "}
        <Link href="/contact" className="font-semibold underline underline-offset-4">
          Contact us
        </Link>{" "}
        — we respond within 24 hours.
      </p>

      <div className="mt-10 grid gap-10">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {category}
            </h2>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <article key={item.question} className="py-5">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-3 text-sm">
        <Link href="/shipping" className="rounded-lg border border-border p-4 hover:bg-muted transition">
          <p className="font-semibold">Shipping policy</p>
          <p className="mt-1 text-muted-foreground text-xs">Delivery times, fees, tracking</p>
        </Link>
        <Link href="/returns" className="rounded-lg border border-border p-4 hover:bg-muted transition">
          <p className="font-semibold">Returns & refunds</p>
          <p className="mt-1 text-muted-foreground text-xs">14-day return window, defective items</p>
        </Link>
        <Link href="/track" className="rounded-lg border border-border p-4 hover:bg-muted transition">
          <p className="font-semibold">Track your order</p>
          <p className="mt-1 text-muted-foreground text-xs">Live status updates</p>
        </Link>
      </div>
    </div>
  );
}
