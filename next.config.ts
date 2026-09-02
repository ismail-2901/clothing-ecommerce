import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  // Expose DATABASE_URL to the Next.js server runtime.
  // During `next build` on CI without a DB, set DATABASE_URL to any non-empty
  // placeholder so Prisma can instantiate. Real queries will fail gracefully
  // at runtime when a real DB is needed — API routes are all dynamic.
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "build-time-placeholder-secret-32-chars",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  }
};

export default nextConfig;
