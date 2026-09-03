import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/db/prisma";
import {
  sendPasswordResetEmail,
  sendVerificationEmail
} from "@/lib/notifications/notification-service";

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
  plugins: [nextCookies()]
});
