export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { Search, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/db/prisma";

const categoryColors: Record<string, "success" | "warning" | "danger" | "muted" | "default"> = {
  HIGH_VALUE: "success",
  ACTIVE: "success",
  NEW: "muted",
  INACTIVE: "muted",
  CANCEL_HEAVY: "warning",
  RETURN_HEAVY: "warning",
  ABANDONED_CHECKOUT: "warning",
  AT_RISK: "danger",
  DELIVERY_FAILURE_RISK: "danger",
};

function riskBadge(score: number) {
  if (score >= 60) return <Badge variant="danger">{score} Critical</Badge>;
  if (score >= 30) return <Badge variant="warning">{score} Medium</Badge>;
  return <Badge variant="muted">{score} Low</Badge>;
}

import { AdminSearchInput } from "@/components/admin/admin-search-input";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { q } = (await searchParams) || {};

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (q && q.trim()) {
    const term = q.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      orders: {
        where: { status: { notIn: ["CANCELLED", "FAILED_DELIVERY"] } },
        select: { grandTotal: true }
      },
      riskAssessments: {
        select: { score: true },
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const customers = users.map((u) => {
    const orderCount = u.orders.length;
    const totalSpent = u.orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const riskScore = u.riskAssessments[0]?.score ?? 0;

    let category = "NEW";
    if (orderCount >= 3 || totalSpent >= 500000) {
      category = "HIGH_VALUE";
    } else if (orderCount > 0) {
      category = "ACTIVE";
    }

    return {
      id: u.id,
      name: u.name || "Customer",
      email: u.email,
      joined: u.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      orders: orderCount,
      spent: totalSpent,
      category,
      riskScore,
      emailVerified: u.emailVerified
    };
  });

  const highValueCount = customers.filter((c) => c.category === "HIGH_VALUE").length;
  const highRiskCount = customers.filter((c) => c.riskScore >= 60).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live accounts synced from user signups</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-md border border-border p-3 text-center min-w-[90px]">
            <p className="text-xl font-semibold">{customers.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center min-w-[90px]">
            <p className="text-xl font-semibold">{highValueCount}</p>
            <p className="text-xs text-muted-foreground">High value</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center min-w-[90px]">
            <p className="text-xl font-semibold">{highRiskCount}</p>
            <p className="text-xs text-muted-foreground">High risk</p>
          </div>
        </div>
      </div>

      <div className="max-w-md">
        <AdminSearchInput placeholder="Search customer name, email, phone…" />
      </div>

      {customers.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <UsersIcon size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No registered customers yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            As new users create accounts or place orders, their profile and purchase data will automatically appear and update here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Customer", "Joined", "Orders", "Total spend", "Category", "Verified", "Risk", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="bg-background hover:bg-muted/30 transition">
                  <td className="px-4 py-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{c.joined}</td>
                  <td className="px-4 py-4 font-semibold">{c.orders}</td>
                  <td className="px-4 py-4 font-semibold">{c.spent > 0 ? formatMoney(c.spent) : "—"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={categoryColors[c.category] ?? "muted"}>
                      {c.category.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={c.emailVerified ? "success" : "muted"}>
                      {c.emailVerified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">{riskBadge(c.riskScore)}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold border border-border hover:bg-muted"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
