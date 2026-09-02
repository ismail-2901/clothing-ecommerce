import type { Metadata } from "next";
import { PackageCheck, PackageOpen, Truck, CheckCircle2, CircleDot } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Order – Atelier Commerce",
  description: "Track your Atelier Commerce order status."
};

// Mock order timeline for demonstration
const orderTimeline = [
  { status: "Order placed", date: "Dec 14, 2024 · 3:42 PM", done: true },
  { status: "Confirmed", date: "Dec 14, 2024 · 4:00 PM", done: true },
  { status: "Processing", date: "Dec 15, 2024 · 9:30 AM", done: true },
  { status: "Packed", date: "Dec 15, 2024 · 2:15 PM", done: true },
  { status: "Shipped", date: "Dec 16, 2024", done: false, current: true },
  { status: "Out for delivery", date: "Expected Dec 17", done: false },
  { status: "Delivered", date: "Expected Dec 17", done: false }
];

export default function TrackPage() {
  return (
    <div className="container-shell py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Order
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Track order</h1>

      {/* Track by number form */}
      <div className="mt-8 max-w-lg">
        <form className="flex gap-2">
          <label className="sr-only" htmlFor="track-order-number">Order number</label>
          <input
            id="track-order-number"
            type="text"
            placeholder="Enter order number (e.g. ATC-0001)"
            className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:bg-zinc-800 transition"
          >
            Track
          </button>
        </form>
      </div>

      {/* Example order */}
      <div className="mt-10 max-w-lg">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="mt-1 font-semibold">ATC-0003</p>
            </div>
            <div className="rounded-sm bg-foreground px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-background">
              Shipped
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4 text-sm">
            <p className="text-muted-foreground">Oversized Cotton Tee / M · 1 item</p>
            <p className="mt-1 text-muted-foreground">Delivering to Dhaka, 1207</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <h2 className="font-semibold">Delivery timeline</h2>
          <div className="mt-4 relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
            <div className="grid gap-0">
              {orderTimeline.map((step, i) => (
                <div key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                    {step.done ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : step.current ? (
                      <CircleDot size={18} className="text-foreground" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${!step.done && !step.current ? "text-muted-foreground" : ""}`}>
                      {step.status}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
