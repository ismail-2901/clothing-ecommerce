import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  const auth = await requireAdminSession("order:manage");
  if (!auth.ok) return auth.response;

  const MAX_EXPORT = 10000;
  const BATCH_SIZE = 1000;
  const logs = [];
  let skip = 0;

  while (skip < MAX_EXPORT) {
    const batch = await prisma.auditLog.findMany({
      skip,
      take: Math.min(BATCH_SIZE, MAX_EXPORT - skip),
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });

    if (batch.length === 0) break;
    logs.push(...batch);
    if (batch.length < BATCH_SIZE) break;
    skip += batch.length;
  }

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
