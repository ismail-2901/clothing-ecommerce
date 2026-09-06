"use client";

import { useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  ShieldAlert,
  Download,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  X,
  CreditCard,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type CustomerItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ordersCount: number;
  totalSpend: number;
  riskScore: number;
  joinedDate: string;
};

export function AdminCustomersManager({
  customers,
}: {
  customers: CustomerItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const totalCount = customers.length;
  const highValueCount = customers.filter((c) => c.totalSpend >= 10000).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgSpend = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
  const atRiskCount = customers.filter((c) => c.riskScore >= 50).length;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    let matchesTier = true;
    if (tierFilter === "VIP") matchesTier = c.totalSpend >= 10000;
    else if (tierFilter === "REGULAR") matchesTier = c.ordersCount > 1 && c.totalSpend < 10000;
    else if (tierFilter === "NEW") matchesTier = c.ordersCount <= 1;
    else if (tierFilter === "RISK") matchesTier = c.riskScore >= 50;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Customer Accounts
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Registered
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage registered shoppers, lifetime value (LTV), risk scores, and purchasing behavior
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition self-start sm:self-auto"
        >
          <Download size={14} />
          <span>Export Customers</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Shoppers</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Registered user accounts</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">VIP / High-Value</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{highValueCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              LTV &gt; ৳10k
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Top spending tier</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Avg. Customer Value</p>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(avgSpend)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Lifetime average revenue</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">At-Risk Accounts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{atRiskCount}</span>
            {atRiskCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Review
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Elevated fraud or return risk</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer name, email, phone number…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Customers", value: "ALL" },
            { label: "VIP Shoppers", value: "VIP" },
            { label: "Regular", value: "REGULAR" },
            { label: "New Accounts", value: "NEW" },
            { label: "At Risk", value: "RISK" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTierFilter(t.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                tierFilter === t.value
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <Users size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No customer accounts found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 text-center">Risk Assessment</th>
                  <th className="py-3 px-4 text-center">Tier</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.map((c) => {
                  const isVIP = c.totalSpend >= 10000;
                  const isRisk = c.riskScore >= 50;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-muted/20 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground text-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-foreground/80">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-foreground">
                        {c.ordersCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-foreground">
                        {formatMoney(c.totalSpend)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isRisk ? (
                          <span className="inline-block rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            High Risk ({c.riskScore})
                          </span>
                        ) : c.riskScore >= 20 ? (
                          <span className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Medium Risk ({c.riskScore})
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Low Risk ({c.riskScore})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isVIP ? (
                          <span className="inline-block rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                            VIP
                          </span>
                        ) : c.ordersCount > 1 ? (
                          <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            Regular
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                            New
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {c.joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                          }}
                          className="rounded border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slideout Customer Details Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-base font-bold text-foreground">Customer Profile</h2>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Avatar and Primary Identity */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background text-xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                      ID: {selectedCustomer.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <span className="text-[11px] text-muted-foreground">Lifetime Value</span>
                  <p className="mt-1 text-base font-black text-foreground">
                    {formatMoney(selectedCustomer.totalSpend)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Completed Orders</span>
                  <p className="mt-1 text-base font-black text-foreground">
                    {selectedCustomer.ordersCount} Orders
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Fraud Risk Score</span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {selectedCustomer.riskScore}/100
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Customer Since</span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {selectedCustomer.joinedDate}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedCustomer.phone || "No phone added"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="text-foreground">Bangladesh (Dhaka / Chattogram)</span>
                  </div>
                </div>
              </div>

              {/* Tags & Internal Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Staff Internal Notes</label>
                <textarea
                  rows={3}
                  defaultValue="Customer prefers bKash payment. Frequent buyer of oversized tees."
                  className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
              <a
                href={`/admin/orders?q=${encodeURIComponent(selectedCustomer.email)}`}
                className="flex-1 text-center rounded-lg bg-foreground py-2 text-xs font-bold text-background hover:bg-foreground/90 transition"
              >
                View Orders →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
