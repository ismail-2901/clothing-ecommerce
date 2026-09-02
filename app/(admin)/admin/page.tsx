export const dynamic = "force-dynamic";
import { ArrowUpRight, PackageCheck, ShieldAlert, ShoppingCart, Users } from "lucide-react";
import { dashboardMetrics } from "@/features/admin/dashboard-data";
import { formatMoney } from "@/lib/utils/money";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Admin dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Role checks are enforced server-side.</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const Icon =
            metric.kind === "revenue"
              ? ArrowUpRight
              : metric.kind === "orders"
                ? ShoppingCart
                : metric.kind === "customers"
                  ? Users
                  : metric.kind === "risk"
                    ? ShieldAlert
                    : PackageCheck;

          return (
            <article key={metric.label} className="rounded-lg border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Icon aria-hidden="true" size={19} />
              </div>
              <p className="mt-4 text-2xl font-semibold">
                {metric.currency ? formatMoney(metric.value) : metric.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{metric.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Order workload</h2>
          <div className="mt-5 grid gap-3">
            {["Pending confirmation", "Packed today", "Failed delivery review"].map(
              (label, index) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-border p-4">
                  <span className="text-sm">{label}</span>
                  <span className="text-sm font-semibold">{[18, 11, 4][index]}</span>
                </div>
              )
            )}
          </div>
        </article>
        <article className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-semibold">Low stock</h2>
          <div className="mt-5 grid gap-3">
            {["Black Linen Shirt / M", "Tailored Trouser / L", "Cropped Jacket / S"].map(
              (label) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-border p-4">
                  <span className="text-sm">{label}</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-danger">
                    Review
                  </span>
                </div>
              )
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

