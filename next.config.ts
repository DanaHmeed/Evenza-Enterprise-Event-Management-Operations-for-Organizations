import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      // Add your event banner image host here, e.g.:
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;