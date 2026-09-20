import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone", // standalone for Docker, native for Vercel
  images: {
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
    ]
  }
};

export default nextConfig;
