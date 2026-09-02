import { shippingPolicy } from "@/features/content/policies";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy – Elaris",
  description: "Delivery times, fees, and shipping information for Elaris orders."
};

export default function ShippingPage() {
  return (
    <div className="container-shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Help
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{shippingPolicy.title}</h1>

      <div className="mt-8 grid gap-8">
        {shippingPolicy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/track" className="font-semibold underline underline-offset-4">Track your order</Link>
        <Link href="/faq" className="font-semibold underline underline-offset-4">View FAQ</Link>
        <Link href="/contact" className="font-semibold underline underline-offset-4">Contact support</Link>
      </div>
    </div>
  );
}
