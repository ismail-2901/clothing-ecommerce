import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;

  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });

  const rows: string[] = [
    ["Timestamp", "Actor", "Email", "Action", "Resource", "Resource ID"].join(",")
  ];

  for (const l of logs) {
    rows.push(
      [
        new Date(l.createdAt).toISOString(),
        csv(l.actor?.name ?? "System"),
        csv(l.actor?.email ?? ""),
        csv(l.action),
        csv(l.resource),
        csv(l.resourceId ?? "")
      ].join(",")
    );
  }

  const body = rows.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-logs-${datestamp()}.csv"`
    }
  });
}

function csv(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}
