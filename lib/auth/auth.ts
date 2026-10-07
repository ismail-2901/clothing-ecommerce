import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/db/prisma";
import {
  sendPasswordResetEmail,
  sendVerificationEmail
} from "@/lib/notifications/notification-service";

// MED-04: Startup validation for BETTER_AUTH_SECRET.
// Production must fail clearly if the secret is missing or insecure (< 32 chars).
// Secret value is never logged or exposed in error messages.
const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret || authSecret.trim().length < 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] Startup validation failed: BETTER_AUTH_SECRET is missing or insecure. " +
      "Production requires an unpredictable secret of at least 32 characters."
    );
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: true
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      if (process.env.EMAIL_PROVIDER === "console" || !process.env.EMAIL_PROVIDER) {
        console.log(`\n[email] Password reset for ${user.email}\n  URL: ${url}\n`);
        return;
      }
      await sendPasswordResetEmail({ to: user.email, resetUrl: url });
    }
  },
  // MED-14: Architecture documentation for email verification.
  // sendOnSignUp is intentionally set to false because user registration executes
  // an interactive 6-digit OTP verification flow (/api/auth/send-otp + /api/auth/verify-otp)
  // via Brevo. Setting sendOnSignUp to true would fire a duplicate, conflicting magic-link
  // email during sign-up, breaking the user-facing OTP onboarding experience.
  emailVerification: {
    sendOnSignUp: false,
    async sendVerificationEmail({ user, url }) {
      if (process.env.EMAIL_PROVIDER === "console" || !process.env.EMAIL_PROVIDER) {
        console.log(`\n[email] Verify account for ${user.email}\n  URL: ${url}\n`);
        return;
      }
      await sendVerificationEmail({ to: user.email, verifyUrl: url });
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          }
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
          }
        }
      : {})
  },
  plugins: [nextCookies()]
});
