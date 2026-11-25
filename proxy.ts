import type { NextRequest } from "next/server";
import {
  convexAuthNextjsProxy,
  nextjsProxyRedirect,
} from "@/lib/convexAuth";
import { safeNextPath } from "@/lib/safeNext";

const isSignInPage = (request: NextRequest) =>
  request.nextUrl.pathname === "/signin";
const isProtectedRoute = (request: NextRequest) =>
  /^\/(hackathon|product)(\/|$)/.test(request.nextUrl.pathname);

export default convexAuthNextjsProxy(async (request, { isAuthenticated }) => {
  if (isSignInPage(request) && (await isAuthenticated())) {
    return nextjsProxyRedirect(
      request,
      safeNextPath(request.nextUrl.searchParams.get("next")),
    );
  }
  if (isProtectedRoute(request) && !(await isAuthenticated())) {
    const { pathname, search } = request.nextUrl;
    const next = encodeURIComponent(pathname + search);
    return nextjsProxyRedirect(request, `/signin?next=${next}`);
  }
});

export const config = {
  // Skip static assets, Next internals and the /auth route handlers
  // (they manage their own cookies).
  matcher: ["/((?!auth(?:/|$)|_next|.*\\..*).*)"],
};
