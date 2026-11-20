import type { NextConfig } from "next";

type ImagesConfig = NonNullable<NextConfig["images"]>;

// Only our own deployment's file URLs. `npx convex deploy --cmd` sets this at build time, so each
// preview gets its own host. Without it (a local build with no Convex), no remote images are allowed.
function convexStoragePatterns(): ImagesConfig["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!raw) return [];
  const url = new URL(raw);
  return [
    {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/api/storage/**",
    },
  ];
}

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: convexStoragePatterns(),
    // Few sizes and one quality keep transformations well under Vercel Hobby's 5K a month.
    deviceSizes: [640, 1080, 1600],
    imageSizes: [256, 400],
    qualities: [75],
  },
};

export default nextConfig;
