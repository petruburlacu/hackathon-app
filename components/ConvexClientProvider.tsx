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
      // Surface a concise error without crashing the tree; downstream provider will also warn
      console.error(
        "❌ NEXT_PUBLIC_CONVEX_URL is not set at build time. " +
          "Auth and Convex client calls will fail. " +
          "Set it on Vercel for the current environment (Preview/Production)."
      );
    }

    if (convexUrl) {
      try {
        console.log("🔗 Initializing Convex client with URL:", convexUrl.substring(0, 30) + "...");
      } catch {
        // no-op for environments that strip console
      }
    }

    return new ConvexReactClient(convexUrl as string, {
      verbose: process.env.NODE_ENV === "development",
    });
  }, []);

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
