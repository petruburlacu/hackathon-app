import { ConvexError } from "convex/values";

// Convex only forwards ConvexError data to clients; plain Error messages are redacted in production.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }
  return fallback;
}
