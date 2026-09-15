import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { hashPassword } from "better-auth/crypto";
import { RoleName } from "@prisma/client";

/**
 * Verifies the master administrator password and bootstraps the admin account in PostgreSQL.
 * If credentials match process.env.ADMIN_PASSWORD (or default "elaris-admin-2026"),
 * it creates/updates the user with SUPER_ADMIN privileges so they can unlock the dashboard.
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password required." },
        { status: 400 }
      );
    }

    const masterPassword = process.env.ADMIN_PASSWORD || "elaris-admin-2026";
    const trimmedPass = password.trim();

    if (trimmedPass !== masterPassword) {
      return NextResponse.json(
        { error: "Invalid administrator email or password." },
        { status: 401 }
      );
    }

    const normalised = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(trimmedPass);

    // 1. Ensure SUPER_ADMIN role exists
    const superAdminRole = await prisma.role.upsert({
      where: { name: RoleName.SUPER_ADMIN },
      update: {},
      create: {
        name: RoleName.SUPER_ADMIN,
        description: "Super Administrator with full access"
      }
    });

    // 2. Ensure user exists and is emailVerified
    const user = await prisma.user.upsert({
      where: { email: normalised },
      update: { emailVerified: true },
      create: {
        name: normalised.split("@")[0],
        email: normalised,
        emailVerified: true
      }
    });

    // 3. Upsert Better Auth credentials account
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id
        }
      },
      update: {
        password: hashedPassword
      },
      create: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashedPassword
      }
    });

    // 4. Assign SUPER_ADMIN role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: superAdminRole.id
      }
    });

    return NextResponse.json({ ok: true, bootstrapped: true });
  } catch (err) {
    console.error("[admin:login-bootstrap]", err);
    return NextResponse.json(
      { error: "Failed to authenticate administrator." },
      { status: 500 }
    );
  }
}
