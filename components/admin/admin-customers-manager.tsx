"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
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
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Ban,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

export type CustomerCRMItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ordersCount: number;
  deliveredCount: number;
  cancelledCount: number;
  returnCount: number;
  totalSpend: number;
  averageOrderValue: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskSignals: string[];
  segment: "HIGH_VALUE" | "REPEAT" | "CANCEL_HEAVY" | "RETURN_HEAVY" | "NEW" | "ACTIVE";
  joinedDate: string;
  lastOrderDate: string | null;
  defaultCity?: string | null;
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    grandTotal: number;
    status: string;
    date: string;
  }>;
};

const SEGMENT_CONFIG: Record<
  CustomerCRMItem["segment"],
  { label: string; badgeClass: string; desc: string }
> = {
  HIGH_VALUE: {
    label: "High Value",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Top spending shoppers (LTV > ৳10k)"
  },
  REPEAT: {
    label: "Repeat",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Multiple successful purchases"
  },
  CANCEL_HEAVY: {
    label: "Cancel Heavy",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    desc: "High cancellation frequency before dispatch"
  },
  RETURN_HEAVY: {
    label: "Return Heavy",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    desc: "Frequent courier return/exchange requests"
  },
  NEW: {
    label: "New Account",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
    desc: "Initial order or newly registered"
  },
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Consistent active shopper"
  }
};

function renderRiskBadge(score: number, level: CustomerCRMItem["riskLevel"]) {
  if (level === "CRITICAL" || score >= 80) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <ShieldAlert size={11} /> Critical ({score})
      </span>
    );
  }
  if (level === "HIGH" || score >= 60) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
        <AlertTriangle size={11} /> High ({score})
      </span>
    );
  }
  if (level === "MEDIUM" || score >= 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        Medium ({score})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
      <ShieldCheck size={11} /> Clean ({score})
    </span>
  );
}

export function AdminCustomersManager({ customers }: { customers: CustomerCRMItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCRMItem | null>(null);

  const totalCount = customers.length;
  const highValueCount = customers.filter((c) => c.segment === "HIGH_VALUE").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgSpend = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
  const atRiskCount = customers.filter(
    (c) => c.riskLevel === "CRITICAL" || c.riskLevel === "HIGH" || c.riskScore >= 50
  ).length;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.defaultCity && c.defaultCity.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesSegment = true;
    if (segmentFilter === "ALL") matchesSegment = true;
    else if (segmentFilter === "AT_RISK") {
      matchesSegment = c.riskLevel === "CRITICAL" || c.riskLevel === "HIGH" || c.riskScore >= 50;
    } else {
      matchesSegment = c.segment === segmentFilter;
    }

    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Customer CRM
            </h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalCount} Shoppers
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Customer intelligence directory, Lifetime Value (LTV), purchasing velocity, and behavioural risk scoring
          </p>
        </div>

        <a
          href="/api/admin/export/customers"
          download
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted/40 transition self-start sm:self-auto"
        >
          <Download size={14} />
          <span>Export Customers CSV</span>
        </a>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-xs font-medium">Total Directory</p>
            <Users size={16} />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{totalCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Registered client profiles</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-xs font-medium">VIP / High-Value</p>
            <Award size={16} className="text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{highValueCount}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
              LTV &gt; ৳10k
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Premium tier shoppers</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-xs font-medium">Average Lifetime Value</p>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{formatMoney(avgSpend)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Completed gross revenue per account</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-xs font-medium">Elevated Risk Flagged</p>
            <ShieldAlert size={16} className="text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{atRiskCount}</span>
            {atRiskCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                Requires Review
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">High cancellation or return frequency</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-background p-4 shadow-xs">
        <div className="relative w-full lg:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search shopper name, email, BD phone (+880), city…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Customer Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { label: "All Shoppers", value: "ALL" },
            { label: "High Value", value: "HIGH_VALUE" },
            { label: "Repeat", value: "REPEAT" },
            { label: "Cancel Heavy", value: "CANCEL_HEAVY" },
            { label: "Return Heavy", value: "RETURN_HEAVY" },
            { label: "New Accounts", value: "NEW" },
            { label: "At Risk", value: "AT_RISK" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSegmentFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                segmentFilter === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-xs">
          <Users size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No customer records found</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No profiles match your current search query or segment filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone / City</th>
                  <th className="py-3 px-4 text-center">Orders &amp; Velocity</th>
                  <th className="py-3 px-4 text-right">Lifetime Value (LTV)</th>
                  <th className="py-3 px-4 text-center">Risk Assessment</th>
                  <th className="py-3 px-4 text-center">Segment</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.map((c) => {
                  const seg = SEGMENT_CONFIG[c.segment];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-muted/20 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground text-xs uppercase">
                            {c.name.charAt(0) || "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-foreground/80">
                        <div>{c.phone || "—"}</div>
                        {c.defaultCity && (
                          <div className="text-[10px] text-muted-foreground font-sans">
                            {c.defaultCity}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-foreground">{c.ordersCount}</span>
                        <div className="text-[10px] text-muted-foreground">
                          {c.deliveredCount} deliv · {c.cancelledCount} canc
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-foreground">
                        {formatMoney(c.totalSpend)}
                        {c.ordersCount > 1 && (
                          <div className="text-[10px] font-normal text-muted-foreground">
                            avg {formatMoney(c.averageOrderValue)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {renderRiskBadge(c.riskScore, c.riskLevel)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${seg.badgeClass}`}
                        >
                          {seg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {c.joinedDate}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                          >
                            Preview
                          </button>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="inline-flex items-center gap-1 rounded bg-foreground px-2.5 py-1 text-xs font-semibold text-background hover:bg-foreground/90 transition"
                          >
                            Profile <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Quick Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="h-full w-full max-w-md bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">Customer Intelligence</h2>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                      SEGMENT_CONFIG[selectedCustomer.segment].badgeClass
                    }`}
                  >
                    {SEGMENT_CONFIG[selectedCustomer.segment].label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Identity */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background text-xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                      ID: {selectedCustomer.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border bg-muted/15 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Lifetime Spend</p>
                  <p className="text-sm font-black text-foreground mt-0.5">
                    {formatMoney(selectedCustomer.totalSpend)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/15 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Orders</p>
                  <p className="text-sm font-black text-foreground mt-0.5">
                    {selectedCustomer.ordersCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/15 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Avg. Order</p>
                  <p className="text-sm font-black text-foreground mt-0.5">
                    {formatMoney(selectedCustomer.averageOrderValue)}
                  </p>
                </div>
              </div>

              {/* Risk Assessment Box */}
              <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Risk Scoring
                  </span>
                  {renderRiskBadge(selectedCustomer.riskScore, selectedCustomer.riskLevel)}
                </div>

                {selectedCustomer.riskSignals.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-muted-foreground">Flagged Indicators:</p>
                    {selectedCustomer.riskSignals.map((sig, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-700">
                        <AlertTriangle size={12} className="shrink-0" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Clean behavioural history. Standard automated fulfillment permitted.
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail size={13} className="text-muted-foreground" />
                  <a href={`mailto:${selectedCustomer.email}`} className="hover:underline">
                    {selectedCustomer.email}
                  </a>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone size={13} className="text-muted-foreground" />
                    <a href={`tel:${selectedCustomer.phone}`} className="hover:underline font-mono">
                      {selectedCustomer.phone}
                    </a>
                  </div>
                )}
                {selectedCustomer.defaultCity && (
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin size={13} className="text-muted-foreground" />
                    <span>{selectedCustomer.defaultCity}, Bangladesh</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={13} />
                  <span>Joined {selectedCustomer.joinedDate}</span>
                </div>
                {selectedCustomer.lastOrderDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={13} />
                    <span>Last active on {selectedCustomer.lastOrderDate}</span>
                  </div>
                )}
              </div>

              {/* Recent Orders Snapshot */}
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">Recent Orders</p>
                  <div className="space-y-1.5">
                    {selectedCustomer.recentOrders.map((ord) => (
                      <Link
                        key={ord.id}
                        href={`/admin/orders/${ord.id}`}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs hover:bg-muted/40 transition"
                      >
                        <div>
                          <p className="font-bold text-foreground">#{ord.orderNumber}</p>
                          <p className="text-[10px] text-muted-foreground">{ord.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-foreground">{formatMoney(ord.grandTotal)}</p>
                          <p className="text-[10px] font-semibold text-muted-foreground capitalize">
                            {ord.status.toLowerCase().replace(/_/g, " ")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-6 border-t border-border flex items-center gap-3">
              <Link
                href={`/admin/customers/${selectedCustomer.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-foreground py-2 text-xs font-bold text-background hover:bg-foreground/90 transition"
              >
                Full CRM Profile <ArrowUpRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
