import crypto from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_ADMIN_PASSWORD = "elaris-admin-2026";
const DB_SETTING_KEY = "admin_credentials";

interface StoredAdminCredentials {
  hash: string;
  salt: string;
  updatedAt: string;
}

// In-memory cache for fast verification
let memoryCredentials: StoredAdminCredentials | null = null;

function getFallbackFilePath(): string {
  // If in serverless (Vercel/Lambda), /tmp is the only writable directory
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "admin-credentials.json");
  }
  return path.join(process.cwd(), "data", "admin-credentials.json");
}

function getFileCredentials(): StoredAdminCredentials | null {
  try {
    const filePath = getFallbackFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (data && typeof data.hash === "string" && typeof data.salt === "string") {
        return data;
      }
    }
  } catch {
    // fallback if file unreadable or doesn't exist
  }
  return null;
}

function saveFileCredentials(record: StoredAdminCredentials): void {
  try {
    const filePath = getFallbackFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
  } catch {
    // Silently ignore if filesystem is read-only (e.g. serverless /var/task)
  }
}

async function getStoredCredentials(): Promise<StoredAdminCredentials | null> {
  if (memoryCredentials) {
    return memoryCredentials;
  }

  // 1. Try Database (PostgreSQL StoreSetting table)
  try {
    const { prisma } = await import("@/db/prisma");
    const setting = await prisma.storeSetting.findUnique({
      where: { key: DB_SETTING_KEY }
    });

    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as unknown as StoredAdminCredentials;
      if (typeof val.hash === "string" && typeof val.salt === "string") {
        memoryCredentials = val;
        return memoryCredentials;
      }
    }
  } catch {
    // Fall back if database is momentarily unreachable
  }

  // 2. Try file fallback
  const fileData = getFileCredentials();
  if (fileData) {
    memoryCredentials = fileData;
    return memoryCredentials;
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

export async function verifyAdminPassword(input: string): Promise<boolean> {
  if (!input) return false;

  const stored = await getStoredCredentials();
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

export async function setAdminPassword(newPassword: string): Promise<void> {
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

  memoryCredentials = record;

  // 1. Save to Database (PostgreSQL StoreSetting)
  let dbSaved = false;
  try {
    const { prisma } = await import("@/db/prisma");
    await prisma.storeSetting.upsert({
      where: { key: DB_SETTING_KEY },
      update: { value: record as any },
      create: { key: DB_SETTING_KEY, value: record as any }
    });
    dbSaved = true;
  } catch (err) {
    console.error("[admin-auth] Could not persist to database:", err);
  }

  // 2. Save to file fallback (safely, won't throw on read-only environments)
  saveFileCredentials(record);

  if (!dbSaved && !memoryCredentials) {
    throw new Error("Failed to persist admin credentials to database.");
  }
}

export function isValidAdminSession(token?: string | null): boolean {
  if (!token) return false;
  const expected = getExpectedAdminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
