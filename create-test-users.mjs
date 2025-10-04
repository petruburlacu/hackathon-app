#!/usr/bin/env node

/**
 * Script to help create test users for the hackathon
 * Run this script and follow the instructions to create:
 * 1. Admin user (admin:password)
 * 2. Regular user for team testing
 */

import { spawnSync } from "child_process";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log("🚀 Hackathon Test User Creation Script");
console.log("=====================================");
console.log("");
console.log("This script will help you create test users for the hackathon.");
console.log("You'll need to manually sign up these users through the web interface.");
console.log("");

async function main() {
  console.log("📋 Test Users to Create:");
  console.log("");
  console.log("1. ADMIN USER:");
  console.log("   Email: admin@hackathon.com");
  console.log("   Password: password");
  console.log("   Role: Will be set as admin (can delete ideas/teams)");
  console.log("");
  console.log("2. REGULAR USER:");
  console.log("   Email: user@hackathon.com");
  console.log("   Password: password");
  console.log("   Role: Will be set as regular user (can create teams)");
  console.log("");
  
  const proceed = await question("Press Enter to continue to the signup instructions...");
  
  console.log("");
  console.log("📝 SIGNUP INSTRUCTIONS:");
  console.log("=======================");
  console.log("");
  console.log("1. Open your browser and go to: http://localhost:3000/signin");
  console.log("");
  console.log("2. Create the ADMIN user:");
  console.log("   - Click 'Sign Up' tab");
  console.log("   - Email: admin@hackathon.com");
  console.log("   - Password: password");
  console.log("   - Click 'Sign Up'");
  console.log("   - Complete the hackathon profile setup (choose any role)");
  console.log("");
  console.log("3. Sign out and create the REGULAR user:");
  console.log("   - Click 'Sign Up' tab");
  console.log("   - Email: user@hackathon.com");
  console.log("   - Password: password");
  console.log("   - Click 'Sign Up'");
  console.log("   - Complete the hackathon profile setup (choose any role)");
  console.log("");
  console.log("4. Test the functionality:");
  console.log("   - Sign in as admin@hackathon.com");
  console.log("   - Go to /hackathon/admin to seed sample data");
  console.log("   - Sign out and sign in as user@hackathon.com");
  console.log("   - Create teams and test the hackathon features");
  console.log("");
  
  const openBrowser = await question("Would you like to open the signin page now? (y/n): ");
  
  if (openBrowser.toLowerCase() === 'y' || openBrowser.toLowerCase() === 'yes') {
    console.log("Opening browser...");
    const platform = process.platform;
    let command;
    
    if (platform === 'darwin') {
      command = 'open';
    } else if (platform === 'win32') {
      command = 'start';
    } else {
      command = 'xdg-open';
    }
    
    spawnSync(command, ['http://localhost:3000/signin'], { stdio: 'inherit' });
  }
  
  console.log("");
  console.log("✅ Setup complete! You can now test the hackathon with these users.");
  console.log("");
  console.log("🔧 ADMIN FEATURES TO TEST:");
  console.log("- Seed sample data (/hackathon/admin)");
  console.log("- Delete ideas and teams");
  console.log("- Migrate team statuses");
  console.log("");
  console.log("👥 USER FEATURES TO TEST:");
  console.log("- Create and join teams");
  console.log("- Submit and vote for ideas");
  console.log("- Assign ideas to teams");
  console.log("- Update team status");
  console.log("");
  
  rl.close();
}

main().catch(console.error);
