import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedUserFixture
} from "./test-db";
import { hasPermission } from "@/lib/auth/permissions";

describe("Integration: Role-Based Access Control (RBAC)", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("distinguishes CUSTOMER from ADMIN roles in the database", async () => {
    const { customer, adminUser } = await seedUserFixture(db);

    const customerRoles = await db.userRole.findMany({
      where: { userId: customer.id },
      include: { role: true }
    });
    expect(customerRoles.some((r) => r.role.name === "ADMIN" || r.role.name === "SUPER_ADMIN")).toBe(false);

    const adminRoles = await db.userRole.findMany({
      where: { userId: adminUser.id },
      include: { role: true }
    });
    expect(adminRoles.some((r) => r.role.name === "ADMIN")).toBe(true);
  });

  it("enforces permission checks based on role definitions", () => {
    // ADMIN has permissions to manage products, orders, offers, inventory
    expect(hasPermission("ADMIN", "product:manage")).toBe(true);
    expect(hasPermission("ADMIN", "order:manage")).toBe(true);
    expect(hasPermission("ADMIN", "offer:manage")).toBe(true);
    expect(hasPermission("ADMIN", "inventory:manage")).toBe(true);

    // CUSTOMER role lacks administrative permissions
    expect(hasPermission("CUSTOMER", "product:manage")).toBe(false);
    expect(hasPermission("CUSTOMER", "order:manage")).toBe(false);
    expect(hasPermission("CUSTOMER", "offer:manage")).toBe(false);
    expect(hasPermission("CUSTOMER", "admin:manage")).toBe(false);
  });

  it("persists granular role-permission mappings in the database", async () => {
    const role = await db.role.create({
      data: {
        name: "SUPER_ADMIN",
        description: "Super Administrator"
      }
    });

    const perm = await db.permission.create({
      data: {
        action: "system:manage",
        description: "System management"
      }
    });

    await db.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: perm.id
      }
    });

    const mapping = await db.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: perm.id
        }
      },
      include: { role: true, permission: true }
    });

    expect(mapping).not.toBeNull();
    expect(mapping?.role.name).toBe("SUPER_ADMIN");
    expect(mapping?.permission.action).toBe("system:manage");
  });
});
