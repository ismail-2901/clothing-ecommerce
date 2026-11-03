import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { hashPassword } from "better-auth/crypto";
import { RoleName } from "@prisma/client";

export async function GET() {
  const auth = await requireAdminSession("admin:manage");
  if (!auth.ok) return auth.response;

  const staffUsers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      roles: {
        some: {
          role: {
            name: { in: [RoleName.SUPER_ADMIN, RoleName.ADMIN] }
          }
        }
      }
    },
    include: {
      roles: { include: { role: true } },
      accounts: { select: { providerId: true } },
      sessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true, ipAddress: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const staff = staffUsers.map((u) => {
    const isSuper = u.roles.some((r) => r.role.name === RoleName.SUPER_ADMIN);
    const hasAdmin = u.roles.some((r) => r.role.name === RoleName.ADMIN);
    const role = isSuper ? "SUPER_ADMIN" : hasAdmin ? "STORE_MANAGER" : "SUPPORT_AGENT";

    const lastSession = u.sessions[0];
    const lastActive = lastSession
      ? new Date(lastSession.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "No active session";

    const hasCredential = u.accounts.some((a) => a.providerId === "credential");

    return {
      id: u.id,
      name: u.name || u.email.split("@")[0],
      email: u.email,
      role,
      rawRole: isSuper ? "SUPER_ADMIN" : "ADMIN",
      emailVerified: u.emailVerified,
      twoFactor: true, // System enforces 2FA policy
      hasCredential,
      lastActive,
      joinedDate: new Date(u.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
  });

  return NextResponse.json({ staff, currentUserId: auth.userId, callerRole: auth.role });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession("admin:manage");
  if (!auth.ok) return auth.response;

  // Prevent unauthorized privilege escalation: only SUPER_ADMIN can invite/create staff
  if (auth.role !== RoleName.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "Forbidden: Only Super Administrators can invite or provision administrative staff." },
      { status: 403 }
    );
  }

  let body: { email?: string; name?: string; role?: string; tempPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, role = "STORE_MANAGER", tempPassword } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid corporate email address is required." }, { status: 422 });
  }

  const normalisedEmail = email.trim().toLowerCase();
  const targetRoleName = role === "SUPER_ADMIN" ? RoleName.SUPER_ADMIN : RoleName.ADMIN;

  // Resolve target Role record
  const roleRecord = await prisma.role.findUnique({
    where: { name: targetRoleName }
  });

  if (!roleRecord) {
    return NextResponse.json({ error: `System role ${targetRoleName} not configured.` }, { status: 500 });
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: normalisedEmail },
    include: { roles: { include: { role: true } } }
  });

  const rawPassword = tempPassword?.trim() || `ElarisAdmin@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = await hashPassword(rawPassword);

  if (user) {
    // Check if user already has this role
    const alreadyHasRole = user.roles.some((r) => r.role.name === targetRoleName);
    if (alreadyHasRole) {
      return NextResponse.json(
        { error: `User ${normalisedEmail} already holds the ${targetRoleName} administrative role.` },
        { status: 409 }
      );
    }

    // Assign role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roleRecord.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roleRecord.id
      }
    });

    // Ensure password credential exists if account didn't have one
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashedPassword
      }
    });
  } else {
    // Create new staff user
    user = await prisma.user.create({
      data: {
        name: name?.trim() || normalisedEmail.split("@")[0],
        email: normalisedEmail,
        emailVerified: true
      },
      include: { roles: { include: { role: true } } }
    });

    // Create credential account
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashedPassword
      }
    });

    // Assign administrative role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id
      }
    });
  }

  // Record immutable audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "STAFF_INVITED",
      resource: "User",
      resourceId: user.id,
      next: {
        email: normalisedEmail,
        role: targetRoleName,
        assignedBy: auth.userId
      },
      metadata: {
        targetEmail: normalisedEmail,
        assignedRole: targetRoleName
      }
    }
  });

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: targetRoleName === RoleName.SUPER_ADMIN ? "SUPER_ADMIN" : "STORE_MANAGER",
        tempPassword: rawPassword
      }
    },
    { status: 201 }
  );
}

