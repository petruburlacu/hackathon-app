import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.convex.cloud" }],
    // Few sizes and one quality keep transformations well under Vercel Hobby's 5K a month.
    deviceSizes: [640, 1080, 1600],
    imageSizes: [256, 400],
    qualities: [75],
  },
};

export default nextConfig;
