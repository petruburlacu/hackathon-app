// Environment variable validation and logging
export function validateEnvironmentVariables() {
  const requiredVars = {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
  };

  const missingVars: string[] = [];
  const presentVars: string[] = [];

  console.log("🔍 Environment Variables Check:");
  console.log("=====================================");

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
      console.error(`❌ Missing: ${key}`);
    } else {
      presentVars.push(key);
      // Mask sensitive values for logging
      const maskedValue = key.includes('URL') || key.includes('DEPLOYMENT') 
        ? value.substring(0, 20) + '...' 
        : '***';
      console.log(`✅ Present: ${key} = ${maskedValue}`);
    }
  });

  console.log("=====================================");
  
  if (missingVars.length > 0) {
    console.error(`🚨 Missing ${missingVars.length} required environment variables:`);
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error("\n💡 Set these in your deployment platform:");
    console.error("   Vercel: Project Settings > Environment Variables");
    console.error("   Netlify: Site Settings > Environment Variables");
    console.error("   Railway: Project > Variables");
    
    return false;
  } else {
    console.log("✅ All required environment variables are present!");
    return true;
  }
}

// Additional environment info
export function logEnvironmentInfo() {
  console.log("\n🌍 Environment Information:");
  console.log("==========================");
  console.log(`Node Environment: ${process.env.NODE_ENV}`);
  console.log(`Platform: ${process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Other'}`);
  console.log(`Build Time: ${new Date().toISOString()}`);
  console.log("==========================\n");
}
