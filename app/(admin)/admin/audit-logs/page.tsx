export const dynamic = "force-dynamic";
import { Clock, FileText, Shield, ShoppingCart, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const logs = [
  {
    id: "al1",
    actor: "admin@elarisstore.com",
    action: "ORDER_STATUS_CHANGED",
    resource: "Order",
    resourceId: "ATC-0002",
    timestamp: "2024-12-15 14:32:00",
    meta: { from: "PROCESSING", to: "SHIPPED" }
  },
  {
    id: "al2",
    actor: "admin@elarisstore.com",
    action: "PRODUCT_PRICE_CHANGED",
    resource: "Product",
    resourceId: "prod_black_linen_shirt",
    timestamp: "2024-12-14 11:20:00",
    meta: { from: "250000", to: "245000" }
  },
  {
    id: "al3",
    actor: "superadmin@elarisstore.com",
    action: "ADMIN_CREATED",
    resource: "User",
    resourceId: "admin_2",
    timestamp: "2024-12-13 09:15:00",
    meta: { email: "newadmin@elarisstore.com", role: "ADMIN" }
  },
  {
    id: "al4",
    actor: "admin@elarisstore.com",
    action: "ORDER_CANCELLED",
    resource: "Order",
    resourceId: "ATC-0005",
    timestamp: "2024-12-12 16:45:00",
    meta: { reason: "Customer request" }
  },
  {
    id: "al5",
    actor: "admin@elarisstore.com",
    action: "INVENTORY_ADJUSTED",
    resource: "Variant",
    resourceId: "ALS-BLK-L",
    timestamp: "2024-12-11 10:30:00",
    meta: { delta: "+15", note: "Restock received" }
  }
];

function actionIcon(action: string) {
  if (action.includes("ORDER")) return <ShoppingCart size={16} />;
  if (action.includes("PRODUCT") || action.includes("INVENTORY")) return <FileText size={16} />;
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

export default function AdminAuditLogsPage() {
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable log of admin actions. Only SUPER_ADMIN can see all entries.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Timestamp", "Actor", "Action", "Resource", "Details"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="bg-background hover:bg-muted/30 transition">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <p className="text-xs">{log.actor}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{actionIcon(log.action)}</span>
                    <span className="text-xs font-medium">{actionLabel(log.action)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{log.resource}</p>
                  <p className="text-xs text-muted-foreground font-mono">{log.resourceId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(log.meta).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
