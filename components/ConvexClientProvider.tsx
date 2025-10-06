"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Initialize Convex client inside the component to ensure env vars are available
  const convex = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set!");
      console.error("This will cause authentication and database connection issues.");
      console.error("Current env vars:", {
        NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
        CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
        CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
        NODE_ENV: process.env.NODE_ENV,
      });
      throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
    }

    console.log("🔗 Initializing Convex client with URL:", convexUrl.substring(0, 30) + "...");

    return new ConvexReactClient(convexUrl, {
      verbose: process.env.NODE_ENV === "development",
    });
  }, []);

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
