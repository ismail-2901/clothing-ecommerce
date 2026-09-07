import crypto from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_ADMIN_PASSWORD = "elaris-admin-2026";
const CREDENTIALS_FILE = path.join(process.cwd(), "data", "admin-credentials.json");

interface StoredAdminCredentials {
  hash: string;
  salt: string;
  updatedAt: string;
}

function getStoredCredentials(): StoredAdminCredentials | null {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
      if (data && typeof data.hash === "string" && typeof data.salt === "string") {
        return data;
      }
    }
  } catch {
    // fallback if file unreadable
  }
  return null;
}

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

  const stored = getStoredCredentials();
  if (stored) {
    const computedHash = crypto
      .createHmac("sha256", stored.salt)
      .update(input)
      .digest("hex");
    if (computedHash.length !== stored.hash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(stored.hash));
  }

  const expected = getAdminPassword();
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export function setAdminPassword(newPassword: string): void {
  const dir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHmac("sha256", salt)
    .update(newPassword)
    .digest("hex");

  const record: StoredAdminCredentials = {
    hash,
    salt,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(record, null, 2), "utf-8");
}

export function isValidAdminSession(token?: string | null): boolean {
  if (!token) return false;
  const expected = getExpectedAdminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
