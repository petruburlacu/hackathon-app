// Server-side environment validation
console.log("🔍 Convex Auth Configuration Check:");
console.log("=====================================");

const convexSiteUrl = process.env.CONVEX_SITE_URL;
const convexDeployment = process.env.CONVEX_DEPLOYMENT;

if (!convexSiteUrl) {
  console.error("❌ CONVEX_SITE_URL is not set!");
  console.error("This will cause authentication redirect issues.");
  console.error("Set CONVEX_SITE_URL to your production domain (e.g., https://your-app.vercel.app)");
} else {
  console.log("✅ CONVEX_SITE_URL:", convexSiteUrl);
}

if (!convexDeployment) {
  console.warn("⚠️  CONVEX_DEPLOYMENT is not set (optional but recommended)");
} else {
  console.log("✅ CONVEX_DEPLOYMENT:", convexDeployment);
}

console.log("=====================================");

export default {
  providers: [
    {
      domain: convexSiteUrl || "http://localhost:3000",
      applicationID: "convex",
    },
  ],
};
