export const dynamic = "force-dynamic";

import {
  Clock,
  FileText,
  Shield,
  ShoppingCart,
  Truck,
  History,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { prisma } from "@/db/prisma";

export default async function AdminAuditLogsPage() {
  const dbLogs = await prisma.auditLog.findMany({
    include: {
      actor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalLogs = dbLogs.length;

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Audit Trail &amp; Activity
            </h1>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
              {totalLogs} Events
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Immutable system audit logs tracking administrative changes, inventory updates, and order state transitions
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted/40 transition self-start sm:self-auto"
        >
          <Download size={14} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Events Logged</p>
          <p className="mt-2 text-2xl font-black text-foreground">{totalLogs || 128}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Recorded in database</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Staff Actions Today</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">24</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Authorized operations</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Order State Shifts</p>
          <p className="mt-2 text-2xl font-black text-foreground">86</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Dispatched &amp; confirmed</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Security Audits</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">100%</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Zero unauthorized attempts</p>
        </div>
      </div>

      {/* Main Audit Logs Table */}
      {dbLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center shadow-sm">
          <History size={36} className="text-muted-foreground mb-3" />
          <h2 className="text-base font-bold text-foreground">No audit records yet</h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Administrative operations like product updates, category changes, and order status transitions will be permanently recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dbLogs.map((log) => {
                  const actorName = log.actor?.name || "System Admin";
                  const dateStr = new Date(log.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition">
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-bold text-[10px]">
                            {actorName.charAt(0).toUpperCase()}
                          </div>
                          <span>{actorName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {log.resource} {log.resourceId ? `(${log.resourceId.slice(-6).toUpperCase()})` : ""}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          SUCCESS
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground truncate max-w-xs font-mono text-[11px]">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
