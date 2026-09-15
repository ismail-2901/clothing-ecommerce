import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateSecureOtp,
  hashOtp,
  parseStoredOtp,
  verifyOtpCode,
  processSendOtp,
  processVerifyOtp,
  MAX_OTP_ATTEMPTS
} from "@/lib/auth/otp";
import { prisma } from "@/db/prisma";
import { rateLimiter } from "@/lib/rate-limit/rate-limit";

// Mock prisma
vi.mock("@/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

// Mock brevo email
vi.mock("@/lib/email/brevo", () => ({
  sendBrevoEmail: vi.fn().mockResolvedValue(undefined)
}));

describe("OTP Security and Utilities", () => {
  it("generates a cryptographically secure 6-digit OTP", () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateSecureOtp();
      expect(otp).toMatch(/^\d{6}$/);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    }
  });

  it("hashes OTP with HMAC-SHA256 digest", () => {
    const code = "123456";
    const hash = hashOtp(code);
    expect(hash).toHaveLength(64);
    expect(hash).toEqual(hashOtp(code));
    expect(hash).not.toEqual(hashOtp("123457"));
  });

  it("parses stored hash and attempts counter", () => {
    const sampleHash = hashOtp("654321");
    expect(parseStoredOtp(`${sampleHash}:2`)).toEqual({
      hash: sampleHash,
      attempts: 2
    });
    expect(parseStoredOtp(sampleHash)).toEqual({
      hash: sampleHash,
      attempts: 0
    });
    expect(parseStoredOtp(null)).toEqual({
      hash: "",
      attempts: 0
    });
  });

  it("verifies OTP codes accurately with timing-safe comparison", () => {
    const code = "789123";
    const hashed = hashOtp(code);

    expect(verifyOtpCode("789123", hashed)).toBe(true);
    expect(verifyOtpCode("789124", hashed)).toBe(false);
    expect(verifyOtpCode("", hashed)).toBe(false);
  });

  it("supports legacy plaintext OTP during migration", () => {
    expect(verifyOtpCode("123456", "123456")).toBe(true);
    expect(verifyOtpCode("123456", "654321")).toBe(false);
  });
});

describe("processSendOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing or invalid email", async () => {
    const res = await processSendOtp("", "127.0.0.1");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });

  it("silently succeeds if user does not exist to prevent enumeration", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await processSendOtp("nobody@example.com", "192.168.1.100");
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  it("blocks resend within 60s cooldown", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: "hashedcode:0",
      // Issued 30s ago, expires in 14.5 minutes
      verificationExpires: new Date(Date.now() + 14.5 * 60 * 1000)
    } as any);

    const res = await processSendOtp("user@example.com", "127.0.0.1");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(429);
    expect(res.error).toContain("60 seconds");
  });

  it("generates and stores hashed OTP when cooldown passed", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: "hashedcode:0",
      // Issued 2 minutes ago, expires in 13 minutes
      verificationExpires: new Date(Date.now() + 13 * 60 * 1000)
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const res = await processSendOtp("user@example.com", "127.0.0.1");
    expect(res.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "user@example.com" },
        data: expect.objectContaining({
          verificationCode: expect.stringMatching(/^[a-f0-9]{64}:0$/)
        })
      })
    );
  });
});

describe("processVerifyOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects expired codes", async () => {
    const code = "123456";
    const hashed = hashOtp(code);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: `${hashed}:0`,
      verificationExpires: new Date(Date.now() - 1000) // expired
    } as any);

    const res = await processVerifyOtp("user@example.com", code, "127.0.0.1");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("expired");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { verificationCode: null, verificationExpires: null }
      })
    );
  });

  it("increments attempts on wrong code", async () => {
    const correctCode = "123456";
    const hashed = hashOtp(correctCode);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: `${hashed}:1`,
      verificationExpires: new Date(Date.now() + 10 * 60 * 1000)
    } as any);

    const res = await processVerifyOtp("user@example.com", "999999", "127.0.0.1");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("3 attempts remaining");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { verificationCode: `${hashed}:2` }
      })
    );
  });

  it("bounds attempts: invalidates code after max failed attempts", async () => {
    const correctCode = "123456";
    const hashed = hashOtp(correctCode);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: `${hashed}:4`, // 4 failed attempts already
      verificationExpires: new Date(Date.now() + 10 * 60 * 1000)
    } as any);

    const res = await processVerifyOtp("user@example.com", "999999", "127.0.0.1");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Too many failed attempts");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { verificationCode: null, verificationExpires: null }
      })
    );
  });

  it("verifies and cleans up code on success", async () => {
    const correctCode = "123456";
    const hashed = hashOtp(correctCode);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      emailVerified: false,
      verificationCode: `${hashed}:2`,
      verificationExpires: new Date(Date.now() + 10 * 60 * 1000)
    } as any);

    const res = await processVerifyOtp("user@example.com", correctCode, "127.0.0.1");
    expect(res.ok).toBe(true);
    expect(res.verified).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          emailVerified: true,
          verificationCode: null,
          verificationExpires: null
        }
      })
    );
  });
});
