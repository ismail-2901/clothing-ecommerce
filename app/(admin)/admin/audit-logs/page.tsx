export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AdminAuditLogsManager, type AuditLogItem } from "@/components/admin/admin-audit-logs-manager";

export default async function AdminAuditLogsPage() {
  const user = await getServerUser();
  const isAdmin =
    user?.roles?.some(
      (ur) => ur.role.name === "ADMIN" || ur.role.name === "SUPER_ADMIN"
    ) ?? false;
  if (!isAdmin) redirect("/login");

  const [dbLogs, totalLogs] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        actor: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.auditLog.count()
  ]);

  const todayStr = new Date().toDateString();
  const adminActionsToday = dbLogs.filter((log) => {
    return new Date(log.createdAt).toDateString() === todayStr;
  }).length;

  const orderStateShifts = dbLogs.filter(
    (log) =>
      log.action?.includes("ORDER") ||
      log.resource === "Order" ||
      log.resource === "Inventory" ||
      log.action?.includes("INVENTORY")
  ).length;

  const logs: AuditLogItem[] = dbLogs.map((l) => ({
    id: l.id,
    actorId: l.actorId,
    actorName: l.actor?.name || "System Admin",
    actorEmail: l.actor?.email || "system@elaris.internal",
    action: l.action,
    resource: l.resource,
    resourceId: l.resourceId,
    previous: (l.previous as Record<string, any>) || null,
    next: (l.next as Record<string, any>) || null,
    metadata: (l.metadata as Record<string, any>) || null,
    createdAt: l.createdAt.toISOString(),
    formattedDate: new Date(l.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  }));

  return (
    <AdminAuditLogsManager
      initialLogs={logs}
      totalLogs={totalLogs}
      adminActionsToday={adminActionsToday}
      orderStateShifts={orderStateShifts}
    />
  );
}
