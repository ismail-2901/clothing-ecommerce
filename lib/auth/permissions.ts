export type RoleName = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export type Permission =
  | "profile:manage_own"
  | "cart:manage_own"
  | "order:create"
  | "order:read_own"
  | "product:manage"
  | "inventory:manage"
  | "order:manage"
  | "offer:manage"
  | "customer:read"
  | "risk:review"
  | "admin:manage"
  | "role:manage"
  | "audit:read"
  | "system:configure";

const rolePermissions: Record<RoleName, Permission[]> = {
  CUSTOMER: ["profile:manage_own", "cart:manage_own", "order:create", "order:read_own"],
  ADMIN: [
    "profile:manage_own",
    "product:manage",
    "inventory:manage",
    "order:manage",
    "offer:manage",
    "customer:read",
    "risk:review"
  ],
  SUPER_ADMIN: [
    "profile:manage_own",
    "cart:manage_own",
    "order:create",
    "order:read_own",
    "product:manage",
    "inventory:manage",
    "order:manage",
    "offer:manage",
    "customer:read",
    "risk:review",
    "admin:manage",
    "role:manage",
    "audit:read",
    "system:configure"
  ]
};

export function hasPermission(role: RoleName, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function assertPermission(role: RoleName, permission: Permission) {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

