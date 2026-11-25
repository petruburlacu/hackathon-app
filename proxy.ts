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
  if (isSignInPage(request) && (await isAuthenticated())) {
    return nextjsProxyRedirect(request, "/hackathon");
  }
  if (isProtectedRoute(request) && !(await isAuthenticated())) {
    return nextjsProxyRedirect(request, "/signin");
  }
});

export const config = {
  // Skip static assets, Next internals and the /auth route handlers
  // (they manage their own cookies).
  matcher: ["/((?!auth(?:/|$)|_next|.*\\..*).*)"],
};
