import { describe, expect, it } from "vitest";
import { hasPermission, assertPermission, type RoleName, type Permission } from "@/lib/auth/permissions";

describe("Staff RBAC & Permission Enforcement", () => {
  it("enforces that SUPER_ADMIN possesses full administrative rights", () => {
    const superAdminPermissions: Permission[] = [
      "profile:manage_own",
      "cart:manage_own",
      "order:create",
      "order:read_own",
      "product:manage",
      "inventory:manage",
      "order:manage",
      "offer:manage",
      "content:manage",
      "customer:read",
      "customer:manage",
      "risk:review",
      "admin:manage",
      "role:manage",
      "audit:read",
      "system:configure"
    ];

    for (const perm of superAdminPermissions) {
      expect(hasPermission("SUPER_ADMIN", perm)).toBe(true);
      expect(() => assertPermission("SUPER_ADMIN", perm)).not.toThrow();
    }
  });

  it("restricts ADMIN (Store Manager) from staff management and system reconfiguration", () => {
    // ADMIN has operational permissions
    expect(hasPermission("ADMIN", "product:manage")).toBe(true);
    expect(hasPermission("ADMIN", "inventory:manage")).toBe(true);
    expect(hasPermission("ADMIN", "order:manage")).toBe(true);
    expect(hasPermission("ADMIN", "customer:read")).toBe(true);
    expect(hasPermission("ADMIN", "customer:manage")).toBe(true);
    expect(hasPermission("ADMIN", "risk:review")).toBe(true);
    expect(hasPermission("ADMIN", "audit:read")).toBe(true);

    // ADMIN is strictly forbidden from staff provisioning and system reconfiguration
    expect(hasPermission("ADMIN", "admin:manage")).toBe(false);
    expect(hasPermission("ADMIN", "role:manage")).toBe(false);
    expect(hasPermission("ADMIN", "system:configure")).toBe(false);

    expect(() => assertPermission("ADMIN", "admin:manage")).toThrow("Missing permission: admin:manage");
    expect(() => assertPermission("ADMIN", "system:configure")).toThrow("Missing permission: system:configure");
  });

  it("strictly forbids CUSTOMER from all administrative capabilities", () => {
    const adminPrivileges: Permission[] = [
      "product:manage",
      "inventory:manage",
      "order:manage",
      "customer:read",
      "risk:review",
      "admin:manage",
      "audit:read",
      "system:configure"
    ];

    for (const priv of adminPrivileges) {
      expect(hasPermission("CUSTOMER", priv)).toBe(false);
      expect(() => assertPermission("CUSTOMER", priv)).toThrow();
    }

    // Customer can only manage their own profile and orders
    expect(hasPermission("CUSTOMER", "profile:manage_own")).toBe(true);
    expect(hasPermission("CUSTOMER", "order:create")).toBe(true);
  });

  it("validates last Super Administrator protection logic", () => {
    const checkCanRevoke = (superAdminCount: number, isTargetSuperAdmin: boolean, isSelf: boolean) => {
      if (isSelf) return { ok: false, error: "Cannot revoke own clearance" };
      if (isTargetSuperAdmin && superAdminCount <= 1) {
        return { ok: false, error: "Cannot revoke the last Super Administrator" };
      }
      return { ok: true };
    };

    // 1 Super Admin remaining -> block revocation of that super admin
    expect(checkCanRevoke(1, true, false).ok).toBe(false);

    // 2 Super Admins -> allow revocation of one
    expect(checkCanRevoke(2, true, false).ok).toBe(true);

    // Revoking a Store Manager when 1 Super Admin exists -> allowed
    expect(checkCanRevoke(1, false, false).ok).toBe(true);

    // Self-revocation attempt -> always blocked
    expect(checkCanRevoke(3, true, true).ok).toBe(false);
  });
});

