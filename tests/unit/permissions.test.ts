import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("limits customer permissions to customer-owned actions", () => {
    expect(hasPermission("CUSTOMER", "order:create")).toBe(true);
    expect(hasPermission("CUSTOMER", "product:manage")).toBe(false);
  });

  it("allows super admins to manage system configuration", () => {
    expect(hasPermission("SUPER_ADMIN", "system:configure")).toBe(true);
  });
});

