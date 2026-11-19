import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Environment validation for middleware
console.log("🔍 Middleware Environment Check:");
console.log("=================================");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CONVEX_SITE_URL:", process.env.CONVEX_SITE_URL ? "✅ Set" : "❌ Missing");
console.log("=================================");

const isSignInPage = createRouteMatcher(["/signin"]);
const isProtectedRoute = createRouteMatcher(["/hackathon(.*)", "/product(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  try {
    if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/hackathon");
    }
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  } catch (error) {
    console.error("🚨 Middleware Authentication Error:");
    console.error("Error:", error);
    console.error("Request URL:", request.url);
    console.error("This might be due to missing environment variables.");
    
    // If it's a protected route and auth fails, redirect to signin
    if (isProtectedRoute(request)) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
