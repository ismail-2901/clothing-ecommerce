import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone", // standalone for Docker, native for Vercel
  images: {
    // Priority-6: common image sizes to minimise layout shift
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: process.env.CLOUDINARY_CLOUD_NAME
          ? `/${process.env.CLOUDINARY_CLOUD_NAME}/**`
          : "/**"
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256]
  },
  // Priority-6: Aggressive HTTP cache headers for immutable static assets
  async headers() {
    return [
      {
        // Next.js built assets -- immutable, cached for 1 year
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        // Public folder assets (images, fonts) -- 1 week
        source: "/(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|eot))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400"
          }
        ]
      },
      {
        // API routes -- no-store by default; handlers can override
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store"
          }
        ]
      }
    ];
  }
};

export default nextConfig;