import type { NextRequest } from "next/server";
import {
  convexAuthNextjsProxy,
  nextjsProxyRedirect,
} from "@/lib/convexAuth";

const isSignInPage = (request: NextRequest) =>
  request.nextUrl.pathname === "/signin";
const isProtectedRoute = (request: NextRequest) =>
  /^\/(hackathon|product)(\/|$)/.test(request.nextUrl.pathname);

export default convexAuthNextjsProxy(async (request, { isAuthenticated }) => {
  try {
    if (isSignInPage(request) && (await isAuthenticated())) {
      return nextjsProxyRedirect(request, "/hackathon");
    }
    if (isProtectedRoute(request) && !(await isAuthenticated())) {
      return nextjsProxyRedirect(request, "/signin");
    }
  } catch (error) {
    console.error("🚨 Middleware Authentication Error:");
    console.error("Error:", error);
    console.error("Request URL:", request.url);
    console.error("This might be due to missing environment variables.");
    
    // If it's a protected route and auth fails, redirect to signin
    if (isProtectedRoute(request)) {
      return nextjsProxyRedirect(request, "/signin");
    }
  }
});

export const config = {
  // Skip static assets, Next internals and the /auth route handlers
  // (they manage their own cookies).
  matcher: ["/((?!auth(?:/|$)|_next|.*\\..*).*)"],
};
