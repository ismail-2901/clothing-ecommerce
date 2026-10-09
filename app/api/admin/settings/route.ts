import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const setting = await prisma.storeSetting.findUnique({
    where: { key: "store_settings" }
  });

  return NextResponse.json({ settings: setting?.value ?? null });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const setting = await prisma.storeSetting.upsert({
    where: { key: "store_settings" },
    update: { value: body as any },
    create: { key: "store_settings", value: body as any }
  });

  return NextResponse.json({ ok: true, settings: setting.value });
}
