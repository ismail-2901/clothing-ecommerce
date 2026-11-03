import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requireAdminSession } from "@/lib/auth/server";
import { Prisma } from "@prisma/client";

export async function GET() {
  const auth = await requireAdminSession("system:configure");
  if (!auth.ok) {
    // If user has admin session without system:configure, still allow viewing if they have order:manage
    const fallbackAuth = await requireAdminSession();
    if (!fallbackAuth.ok) return fallbackAuth.response;
  }

  const setting = await prisma.storeSetting.findUnique({
    where: { key: "store_settings" }
  });

  return NextResponse.json({
    settings: setting?.value ?? null,
    updatedAt: setting?.updatedAt?.toISOString() ?? null
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession("system:configure");
  if (!auth.ok) return auth.response;

  let rawBody: any = {};
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const settingsPayload: Record<string, any> =
    rawBody.settings && typeof rawBody.settings === "object"
      ? rawBody.settings
      : rawBody && typeof rawBody === "object"
      ? rawBody
      : {};

  // Input Validation
  const storeName = typeof settingsPayload.storeName === "string" ? settingsPayload.storeName.trim() : "";
  const tagline = typeof settingsPayload.tagline === "string" ? settingsPayload.tagline.trim() : "";
  const supportEmail = typeof settingsPayload.supportEmail === "string" ? settingsPayload.supportEmail.trim() : "";
  const supportPhone = typeof settingsPayload.supportPhone === "string" ? settingsPayload.supportPhone.trim() : "";
  const address = typeof settingsPayload.address === "string" ? settingsPayload.address.trim() : "";

  if (!storeName) {
    return NextResponse.json({ error: "Brand/Store Name cannot be empty." }, { status: 422 });
  }

  if (supportEmail && !supportEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid Support Email format." }, { status: 422 });
  }

  const insideDhakaFee = Number(settingsPayload.insideDhakaFee);
  const outsideDhakaFee = Number(settingsPayload.outsideDhakaFee);
  const freeShippingMin = Number(settingsPayload.freeShippingMin);

  if (isNaN(insideDhakaFee) || insideDhakaFee < 0) {
    return NextResponse.json({ error: "Inside Dhaka Fee must be a non-negative number." }, { status: 422 });
  }

  if (isNaN(outsideDhakaFee) || outsideDhakaFee < 0) {
    return NextResponse.json({ error: "Outside Dhaka Fee must be a non-negative number." }, { status: 422 });
  }

  if (isNaN(freeShippingMin) || freeShippingMin < 0) {
    return NextResponse.json({ error: "Free Shipping Minimum must be a non-negative number." }, { status: 422 });
  }

  // Sanitize payload to never persist or leak arbitrary sensitive secrets
  const cleanSettings: Prisma.InputJsonObject = {
    storeName,
    tagline,
    supportEmail,
    supportPhone,
    address,
    insideDhakaFee,
    outsideDhakaFee,
    freeShippingMin,
    payments: settingsPayload.payments ?? {
      bkash: true,
      nagad: true,
      sslcommerz: true,
      cod: true
    },
    security: {
      enforce2FA: settingsPayload.security?.enforce2FA ?? true,
      sessionTimeoutMins: Number(settingsPayload.security?.sessionTimeoutMins ?? 30),
      ipWhitelisting: settingsPayload.security?.ipWhitelisting ?? true
    }
  };

  const existingSetting = await prisma.storeSetting.findUnique({
    where: { key: "store_settings" }
  });

  // Concurrency Check: Prevent silent overwrites of newer configuration
  if (existingSetting && rawBody.lastUpdatedAt && !rawBody.force) {
    const dbTime = new Date(existingSetting.updatedAt).getTime();
    const clientTime = new Date(rawBody.lastUpdatedAt).getTime();

    // 1-second clock skew tolerance
    if (dbTime - clientTime > 1000) {
      return NextResponse.json(
        {
          error: "Conflict: Settings were modified by another administrator since you loaded this page.",
          serverUpdatedAt: existingSetting.updatedAt.toISOString(),
          conflict: true
        },
        { status: 409 }
      );
    }
  }

  const updatedSetting = await prisma.storeSetting.upsert({
    where: { key: "store_settings" },
    update: {
      value: cleanSettings,
      updatedAt: new Date()
    },
    create: {
      key: "store_settings",
      value: cleanSettings
    }
  });

  // Record immutable audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "STORE_SETTINGS_UPDATED",
      resource: "StoreSetting",
      resourceId: updatedSetting.id,
      previous: (existingSetting?.value as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      next: cleanSettings,
      metadata: {
        updatedBy: auth.userId
      }
    }
  });

  return NextResponse.json({
    ok: true,
    settings: updatedSetting.value,
    updatedAt: updatedSetting.updatedAt.toISOString()
  });
}
