import crypto from "node:crypto";
import { prisma } from "@/db/prisma";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { buildOtpEmail } from "@/lib/email/otp-template";

export const MAX_OTP_ATTEMPTS = 5;
export const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
export const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Extracts client IP address from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

/**
 * Generates a cryptographically secure 6-digit numeric string.
 */
export function generateSecureOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Hashes an OTP code using HMAC-SHA256 with the app secret.
 */
export function hashOtp(code: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for OTP hashing.");
  return crypto.createHmac("sha256", secret).update(code.trim()).digest("hex");
}


/**
 * Parses stored OTP string which may be in format `${hash}:${attempts}` or legacy format.
 */
export function parseStoredOtp(storedValue: string | null): { hash: string; attempts: number } {
  if (!storedValue) return { hash: "", attempts: 0 };
  const colonIndex = storedValue.lastIndexOf(":");
  if (colonIndex !== -1) {
    const hash = storedValue.substring(0, colonIndex);
    const attempts = parseInt(storedValue.substring(colonIndex + 1), 10);
    return { hash, attempts: Number.isNaN(attempts) ? 0 : attempts };
  }
  return { hash: storedValue, attempts: 0 };
}

/**
 * Constant-time comparison between user input code and stored HMAC hash.
 */
export function verifyOtpCode(inputCode: string, storedHash: string): boolean {
  if (!inputCode || !storedHash) return false;

  const computed = hashOtp(inputCode);
  if (computed.length !== storedHash.length) return false;

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}


/**
 * Hardened OTP generation and delivery.
 * - Enforces IP-based and Account-based rate limits.
 * - Enforces 60-second cooldown per account.
 * - Cryptographically secure OTP generation.
 * - Stores HMAC hash + 0 attempts counter.
 * - Does not leak user existence (returns generic success).
 */
export async function processSendOtp(
  email: unknown,
  clientIp: string
): Promise<{ ok: boolean; error?: string; status: number }> {
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Email required.", status: 400 };
  }

  const normalised = email.trim().toLowerCase();

  // 1. IP rate limit: max 10 requests per minute
  const ipLimit = await rateLimiter.consume(`send-otp:ip:${clientIp}`, 10, 60_000);
  if (!ipLimit.allowed) {
    return {
      ok: false,
      error: "Too many code requests from this network. Please wait a minute.",
      status: 429
    };
  }

  // 2. Account rate limit: max 3 requests per 3 minutes
  const acctLimit = await rateLimiter.consume(`send-otp:account:${normalised}`, 3, 180_000);
  if (!acctLimit.allowed) {
    return {
      ok: false,
      error: "Too many code requests for this account. Please wait 3 minutes.",
      status: 429
    };
  }

  const user = await prisma.user.findUnique({ where: { email: normalised } });
  if (!user) {
    // Silently return ok to prevent user enumeration
    return { ok: true, status: 200 };
  }

  if (user.emailVerified) {
    return { ok: false, error: "Email already verified.", status: 400 };
  }

  // 3. Cooldown check: prevent resend within 60 seconds
  if (user.verificationExpires && user.verificationCode) {
    const remainingMs = user.verificationExpires.getTime() - Date.now();
    // 15 min expiry - 1 min cooldown = remaining > 14 minutes
    if (remainingMs > OTP_EXPIRY_MS - OTP_COOLDOWN_MS) {
      return {
        ok: false,
        error: "Please wait 60 seconds before requesting another code.",
        status: 429
      };
    }
  }

  // 4. Secure generation and HMAC storage
  const code = generateSecureOtp();
  const hashed = hashOtp(code);
  const expires = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.user.update({
    where: { email: normalised },
    data: {
      verificationCode: `${hashed}:0`,
      verificationExpires: expires
    }
  });

  // 5. Send notification email
  const { subject, html, text } = buildOtpEmail(code);
  await sendBrevoEmail({ to: normalised, subject, html, text });

  return { ok: true, status: 200 };
}

/**
 * Hardened OTP verification.
 * - Enforces IP-based and Account-based rate limits.
 * - Bounded verification attempts (max 5 failed attempts before code invalidation).
 * - Constant-time comparison to prevent timing attacks.
 * - Atomic invalidation on expiration or max attempts exceeded.
 */
export async function processVerifyOtp(
  email: unknown,
  code: unknown,
  clientIp: string
): Promise<{ ok: boolean; error?: string; verified?: boolean; status: number }> {
  if (!email || !code || typeof email !== "string" || typeof code !== "string") {
    return { ok: false, error: "Email and code required.", status: 400 };
  }

  const normalised = email.trim().toLowerCase();
  const trimmedCode = code.trim();

  // 1. IP rate limit: max 20 verify requests per minute
  const ipLimit = await rateLimiter.consume(`verify-otp:ip:${clientIp}`, 20, 60_000);
  if (!ipLimit.allowed) {
    return {
      ok: false,
      error: "Too many verification attempts from this network. Please wait a minute.",
      status: 429
    };
  }

  // 2. Account rate limit: max 10 verify attempts per minute
  const acctLimit = await rateLimiter.consume(`verify-otp:account:${normalised}`, 10, 60_000);
  if (!acctLimit.allowed) {
    return {
      ok: false,
      error: "Too many verification attempts for this account. Please wait a minute.",
      status: 429
    };
  }

  const user = await prisma.user.findUnique({ where: { email: normalised } });

  if (!user || !user.verificationCode || !user.verificationExpires) {
    return { ok: false, error: "Invalid or expired code.", status: 400 };
  }

  if (user.emailVerified) {
    return { ok: false, error: "Email already verified.", status: 400 };
  }

  // Check expiration
  if (user.verificationExpires < new Date()) {
    await prisma.user.update({
      where: { email: normalised },
      data: { verificationCode: null, verificationExpires: null }
    });
    return { ok: false, error: "Code has expired. Request a new one.", status: 400 };
  }

  const { hash: storedHash, attempts } = parseStoredOtp(user.verificationCode);

  // Check if attempts already exhausted
  if (attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.user.update({
      where: { email: normalised },
      data: { verificationCode: null, verificationExpires: null }
    });
    return {
      ok: false,
      error: "Too many failed attempts. Code has been invalidated. Please request a new one.",
      status: 400
    };
  }

  const isValid = verifyOtpCode(trimmedCode, storedHash);

  if (!isValid) {
    const nextAttempts = attempts + 1;
    if (nextAttempts >= MAX_OTP_ATTEMPTS) {
      await prisma.user.update({
        where: { email: normalised },
        data: { verificationCode: null, verificationExpires: null }
      });
      return {
        ok: false,
        error: "Too many failed attempts. Code has been invalidated. Please request a new one.",
        status: 400
      };
    }

    await prisma.user.update({
      where: { email: normalised },
      data: { verificationCode: `${storedHash}:${nextAttempts}` }
    });

    const remaining = MAX_OTP_ATTEMPTS - nextAttempts;
    return {
      ok: false,
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      status: 400
    };
  }

  // Verification succeeded: mark emailVerified and clear OTP
  await prisma.user.update({
    where: { email: normalised },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationExpires: null
    }
  });

  return { ok: true, verified: true, status: 200 };
}
