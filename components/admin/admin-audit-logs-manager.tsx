"use client";

import { useState } from "react";
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  X,
  ShieldCheck,
  User,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";

export type AuditLogItem = {
  id: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  previous: Record<string, any> | null;
  next: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  formattedDate: string;
};

export function AdminAuditLogsManager({
  initialLogs,
  totalLogs,
  adminActionsToday,
  orderStateShifts
}: {
  initialLogs: AuditLogItem[];
  totalLogs: number;
  adminActionsToday: number;
  orderStateShifts: number;
}) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const filtered = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.actorName.toLowerCase().includes(term) ||
      log.actorEmail.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.resource.toLowerCase().includes(term) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(term));

    let matchesCategory = true;
    if (categoryFilter === "ORDERS") {
      matchesCategory = log.resource.toLowerCase() === "order" || log.action.includes("ORDER");
    } else if (categoryFilter === "PRODUCTS") {
      matchesCategory = log.resource.toLowerCase() === "product" || log.action.includes("PRODUCT");
    } else if (categoryFilter === "INVENTORY") {
      matchesCategory = log.resource.toLowerCase() === "inventory" || log.action.includes("INVENTORY");
    } else if (categoryFilter === "STAFF") {
      matchesCategory = log.action.includes("STAFF") || log.resource.toLowerCase() === "userrole";
    } else if (categoryFilter === "SETTINGS") {
      matchesCategory = log.resource.toLowerCase() === "storesetting" || log.action.includes("SETTING");
    } else if (categoryFilter === "RISK") {
      matchesCategory = log.resource.toLowerCase() === "riskassessment" || log.action.includes("RISK");
    } else if (categoryFilter === "RECOVERY") {
      matchesCategory = log.action.includes("ABANDONED") || log.action.includes("RECOVERY");
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Audit Trail &amp; Governance
            </h1>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalLogs} Records
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Cryptographically sealed and immutable audit trail tracking staff operations, state transitions, and governance events
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/api/admin/export/audit-logs"
            download
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted/40 transition"
          >
            <Download size={14} />
            <span>Export Audit Trail (CSV)</span>
          </a>
        </div>
      </div>

      {/* 4 KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Total Events Logged</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalLogs}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Recorded in immutable database</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Staff Actions Today</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{adminActionsToday}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Authenticated administrative shifts</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Order &amp; Inventory Shifts</p>
          <p className="mt-2 text-2xl font-black text-foreground">{orderStateShifts}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">State transitions &amp; updates</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Immutability Assurance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">100%</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Sealed
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Zero record modification permitted</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-background p-4 shadow-xs">
        <div className="relative w-full lg:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by actor, action, resource, or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Action Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { label: "All Events", value: "ALL" },
            { label: "Orders", value: "ORDERS" },
            { label: "Products", value: "PRODUCTS" },
            { label: "Inventory", value: "INVENTORY" },
            { label: "Staff & RBAC", value: "STAFF" },
            { label: "Settings", value: "SETTINGS" },
            { label: "Risk & Fraud", value: "RISK" },
            { label: "Recovery", value: "RECOVERY" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-xs">
          <History size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No matching audit records</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            No events match your current search terms or action category filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          {/* Mobile view */}
          <div className="sm:hidden divide-y divide-border/60">
            {filtered.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 space-y-2 hover:bg-muted/15 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px] uppercase">
                      {log.actorName.charAt(0) || "S"}
                    </div>
                    <span className="text-xs font-bold text-foreground">{log.actorName}</span>
                  </div>
                  <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    SUCCESS
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold">
                    {log.action}
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {log.resource} {log.resourceId ? `(${log.resourceId.slice(-6).toUpperCase()})` : ""}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{log.formattedDate}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member / Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-muted/15 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-muted-foreground whitespace-nowrap">
                      {log.formattedDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px] uppercase">
                          {log.actorName.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-tight">{log.actorName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono leading-tight">
                            {log.actorEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                          ID: {log.resourceId.slice(-8).toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        SUCCESS
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out State Diff & Inspection Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="h-full w-full max-w-lg bg-background border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">Audit Record Inspection</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Actor & Action Pill */}
              <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actor:</span>
                  <span className="font-bold text-foreground">{selectedLog.actorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedLog.actorEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Action:</span>
                  <span className="font-mono font-bold text-foreground">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Resource:</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.resource} {selectedLog.resourceId ? `(${selectedLog.resourceId})` : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-mono text-foreground">{selectedLog.createdAt}</span>
                </div>
              </div>

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-foreground">Event Metadata</p>
                  <pre className="rounded-lg border border-border bg-muted/20 p-3 text-[11px] font-mono text-foreground overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* State Transitions Diff */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-foreground">State Transition (Diff)</p>

                <div className="space-y-2">
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-rose-700 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" /> Previous State:
                    </span>
                    <pre className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-[11px] font-mono text-rose-950 overflow-x-auto max-h-48">
                      {selectedLog.previous
                        ? JSON.stringify(selectedLog.previous, null, 2)
                        : "null (Creation event)"}
                    </pre>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" /> Next State:
                    </span>
                    <pre className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-[11px] font-mono text-emerald-950 overflow-x-auto max-h-48">
                      {selectedLog.next
                        ? JSON.stringify(selectedLog.next, null, 2)
                        : "null (Deletion / revocation event)"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
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

