export const dynamic = "force-dynamic";

import { Clock, FileText, Shield, ShoppingCart, Truck, History } from "lucide-react";
import { prisma } from "@/db/prisma";

function actionIcon(action: string) {
  if (action.includes("ORDER")) return <ShoppingCart size={16} />;
  if (action.includes("PRODUCT") || action.includes("INVENTORY") || action.includes("CATEGORY")) return <FileText size={16} />;
  if (action.includes("ADMIN") || action.includes("ROLE")) return <Shield size={16} />;
  if (action.includes("SHIP") || action.includes("DELIVERY")) return <Truck size={16} />;
  return <Clock size={16} />;
}

function actionLabel(action: string) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminAuditLogsPage() {
  const dbLogs = await prisma.auditLog.findMany({
    include: {
      actor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable audit trail of administrative modifications and order state transitions
        </p>
      </div>

      {dbLogs.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <History size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">No audit records yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Administrative operations like product updates, category changes, and order status transitions will be permanently recorded here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Timestamp", "Actor", "Action", "Resource", "Details"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dbLogs.map((log) => {
                const actorName = log.actor?.name || log.actor?.email || "System Admin";
                const dateStr = log.createdAt.toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const meta = log.next || log.metadata || log.previous || {};
                const metaString =
                  typeof meta === "object" && meta !== null
                    ? Object.entries(meta as Record<string, unknown>)
                        .filter(([_, v]) => typeof v === "string" || typeof v === "number")
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")
                    : "";

                return (
                  <tr key={log.id} className="bg-background hover:bg-muted/30 transition">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{actorName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{actionIcon(log.action)}</span>
                        <span className="text-xs font-medium">{actionLabel(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{log.resource}</p>
                      {log.resourceId && (
                        <p className="text-xs text-muted-foreground font-mono">{log.resourceId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground max-w-sm truncate">
                        {metaString || "—"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
