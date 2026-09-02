export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { Search, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

const customers = [
  { id: "c1", name: "Nusrat Rahman", email: "nusrat@example.com", joined: "2024-09-01", orders: 4, spent: 1200000, category: "HIGH_VALUE", riskScore: 8 },
  { id: "c2", name: "Kamrul Hasan", email: "kamrul@example.com", joined: "2024-10-15", orders: 2, spent: 490000, category: "ACTIVE", riskScore: 15 },
  { id: "c3", name: "Sadia Islam", email: "sadia@example.com", joined: "2024-11-20", orders: 1, spent: 145000, category: "NEW", riskScore: 5 },
  { id: "c4", name: "Rifat Ahmed", email: "rifat@example.com", joined: "2024-08-05", orders: 0, spent: 0, category: "INACTIVE", riskScore: 20 },
  { id: "c5", name: "Tanvir Hossain", email: "tanvir@example.com", joined: "2024-11-01", orders: 3, spent: 735000, category: "CANCEL_HEAVY", riskScore: 68 },
  { id: "c6", name: "Meherun Nesa", email: "meherun@example.com", joined: "2024-12-01", orders: 1, spent: 395000, category: "ABANDONED_CHECKOUT", riskScore: 30 },
];

const categoryColors: Record<string, "success" | "warning" | "danger" | "muted" | "default"> = {
  HIGH_VALUE:          "success",
  ACTIVE:              "success",
  NEW:                 "muted",
  INACTIVE:            "muted",
  CANCEL_HEAVY:        "warning",
  RETURN_HEAVY:        "warning",
  ABANDONED_CHECKOUT:  "warning",
  AT_RISK:             "danger",
  DELIVERY_FAILURE_RISK: "danger",
};

function riskBadge(score: number) {
  if (score >= 60) return <Badge variant="danger">{score} Critical</Badge>;
  if (score >= 30) return <Badge variant="warning">{score} Medium</Badge>;
  return <Badge variant="muted">{score} Low</Badge>;
}

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Customers</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold">{customers.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold">{customers.filter(c => c.category === "HIGH_VALUE").length}</p>
            <p className="text-xs text-muted-foreground">High value</p>
          </div>
          <div className="rounded-md border border-border p-3 text-center">
            <p className="text-xl font-semibold">{customers.filter(c => c.riskScore >= 60).length}</p>
            <p className="text-xs text-muted-foreground">High risk</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-background px-4">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search name, email…"
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Customer", "Joined", "Orders", "Total spend", "Category", "Risk", ""].map((h) => (
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
                <td className="px-4 py-4">{c.orders}</td>
                <td className="px-4 py-4 font-semibold">{c.spent > 0 ? formatMoney(c.spent) : "—"}</td>
                <td className="px-4 py-4">
                  <Badge variant={categoryColors[c.category] ?? "muted"}>
                    {c.category.toLowerCase().replace(/_/g, " ")}
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
    </div>
  );
}
