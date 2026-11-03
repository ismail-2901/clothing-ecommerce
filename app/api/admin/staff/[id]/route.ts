import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/server";
import { prisma } from "@/db/prisma";
import { RoleName } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("admin:manage");
  if (!auth.ok) return auth.response;

  if (auth.role !== RoleName.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "Forbidden: Only Super Administrators can alter staff roles and permissions." },
      { status: 403 }
    );
  }

  const { id } = await params;

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role } = body;
  if (!role || !["SUPER_ADMIN", "STORE_MANAGER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role specified." }, { status: 422 });
  }

  const targetRoleName = role === "SUPER_ADMIN" ? RoleName.SUPER_ADMIN : RoleName.ADMIN;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } }
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
  }

  const isCurrentlySuper = targetUser.roles.some((r) => r.role.name === RoleName.SUPER_ADMIN);

  // If demoting from SUPER_ADMIN, ensure it is NOT the last remaining SUPER_ADMIN
  if (isCurrentlySuper && targetRoleName !== RoleName.SUPER_ADMIN) {
    const superAdminCount = await prisma.userRole.count({
      where: {
        role: { name: RoleName.SUPER_ADMIN },
        user: { deletedAt: null }
      }
    });

    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Protection violation: Cannot demote the last remaining Super Administrator in the system." },
        { status: 400 }
      );
    }
  }

  const newRoleRecord = await prisma.role.findUnique({
    where: { name: targetRoleName }
  });

  if (!newRoleRecord) {
    return NextResponse.json({ error: `Role ${targetRoleName} not found.` }, { status: 500 });
  }

  // Remove existing admin roles first
  const adminRoles = await prisma.role.findMany({
    where: { name: { in: [RoleName.SUPER_ADMIN, RoleName.ADMIN] } }
  });
  const adminRoleIds = adminRoles.map((r) => r.id);

  await prisma.userRole.deleteMany({
    where: {
      userId: targetUser.id,
      roleId: { in: adminRoleIds }
    }
  });

  // Assign the new role
  await prisma.userRole.create({
    data: {
      userId: targetUser.id,
      roleId: newRoleRecord.id
    }
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "STAFF_ROLE_UPDATED",
      resource: "User",
      resourceId: targetUser.id,
      previous: {
        roles: targetUser.roles.map((r) => r.role.name)
      },
      next: {
        role: targetRoleName
      },
      metadata: {
        targetEmail: targetUser.email,
        updatedBy: auth.userId
      }
    }
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      role: targetRoleName === RoleName.SUPER_ADMIN ? "SUPER_ADMIN" : "STORE_MANAGER"
    }
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("admin:manage");
  if (!auth.ok) return auth.response;

  if (auth.role !== RoleName.SUPER_ADMIN) {
    return NextResponse.json(
      { error: "Forbidden: Only Super Administrators can revoke administrative privileges." },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Prevent self-revocation
  if (id === auth.userId) {
    return NextResponse.json(
      { error: "Action blocked: Administrators cannot revoke their own clearance." },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } }
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
  }

  const isSuper = targetUser.roles.some((r) => r.role.name === RoleName.SUPER_ADMIN);

  // Protect last SUPER_ADMIN
  if (isSuper) {
    const superAdminCount = await prisma.userRole.count({
      where: {
        role: { name: RoleName.SUPER_ADMIN },
        user: { deletedAt: null }
      }
    });

    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Protection violation: Cannot revoke the last authorized Super Administrator in the system." },
        { status: 400 }
      );
    }
  }

  // Find all admin roles and remove them from userRole
  const adminRoles = await prisma.role.findMany({
    where: { name: { in: [RoleName.SUPER_ADMIN, RoleName.ADMIN] } }
  });
  const adminRoleIds = adminRoles.map((r) => r.id);

  await prisma.userRole.deleteMany({
    where: {
      userId: targetUser.id,
      roleId: { in: adminRoleIds }
    }
  });

  // Invalidate active sessions to immediately terminate administrative dashboard access
  await prisma.session.deleteMany({
    where: { userId: targetUser.id }
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      actorId: auth.userId,
      action: "STAFF_REVOKED",
      resource: "User",
      resourceId: targetUser.id,
      previous: {
        roles: targetUser.roles.map((r) => r.role.name)
      },
      next: {
        roles: []
      },
      metadata: {
        targetEmail: targetUser.email,
        revokedBy: auth.userId
      }
    }
  });

  return NextResponse.json({ ok: true, revokedId: targetUser.id });
}

