import crypto from "crypto";

const DEFAULT_ADMIN_PASSWORD = "elaris-admin-2026";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function getExpectedAdminToken(): string {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "elaris-admin-secret-salt-2026";
  return crypto
    .createHmac("sha256", secret)
    .update("admin_verified_session")
    .digest("hex");
}

export function verifyAdminPassword(input: string): boolean {
  if (!input) return false;
  const expected = getAdminPassword();
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export function isValidAdminSession(token?: string | null): boolean {
  if (!token) return false;
  const expected = getExpectedAdminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
