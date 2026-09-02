import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  },
  // Expose critical env vars to the Next.js server runtime.
  // During `next build` without a DB (e.g. Vercel build step), placeholders
  // allow Prisma to instantiate. Real queries are all dynamic — they will
  // succeed at runtime once real env vars are set in the hosting platform.
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    DIRECT_URL:
      process.env.DIRECT_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ?? "build-time-placeholder-secret-32-chars",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  }
};

export default nextConfig;
