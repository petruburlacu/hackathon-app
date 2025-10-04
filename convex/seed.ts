import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Sample hackathon ideas
const sampleIdeas = [
  {
    title: "AI-Powered Code Review Assistant",
    description: "An intelligent tool that automatically reviews code submissions, suggests improvements, and identifies potential bugs using machine learning. The assistant would learn from code patterns and provide contextual feedback to developers, making code reviews faster and more thorough.",
  },
  {
    title: "Retro Gaming Social Platform",
    description: "A social networking platform specifically designed for retro gaming enthusiasts. Features include game library sharing, multiplayer matchmaking for classic games, achievement systems, and community forums. Built with a nostalgic 8-bit aesthetic and modern web technologies.",
  },
  {
    title: "Smart Home Energy Optimizer",
    description: "An IoT solution that monitors household energy consumption and automatically optimizes usage patterns. Uses machine learning to predict energy needs, integrates with smart devices, and provides real-time recommendations to reduce electricity bills while maintaining comfort.",
  },
  {
    title: "AR Shopping Experience",
    description: "Augmented reality mobile app that lets users visualize furniture and home decor in their actual space before purchasing. Features include 3D model rendering, size scaling, color matching, and integration with e-commerce platforms for seamless shopping experience.",
  },
  {
    title: "Blockchain Voting System",
    description: "A secure, transparent voting platform using blockchain technology for elections and polls. Ensures voter anonymity while maintaining verifiable results, prevents fraud, and provides real-time vote counting with immutable audit trails.",
  },
  {
    title: "Mental Health Chatbot",
    description: "An AI-powered mental health companion that provides 24/7 emotional support, mood tracking, and connects users with professional resources. Features natural language processing, crisis detection, and personalized wellness recommendations based on user interactions.",
  }
];

export const seedHackathonData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingIdeas = await ctx.db.query("ideas").collect();
    if (existingIdeas.length > 0) {
      throw new Error("Hackathon data already exists. Clear existing data first.");
    }

    // Get the current user ID (the admin seeding the data)
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Must be authenticated to seed data");
    }

    console.log("🌱 Seeding hackathon data...");

    // Create sample ideas
    const createdIdeas = [];
    for (const idea of sampleIdeas) {
      const ideaId = await ctx.db.insert("ideas", {
        title: idea.title,
        description: idea.description,
        authorId: userId, // Use the authenticated user's ID
        createdAt: Date.now(),
        votes: 0,
        isSelected: false,
      });
      createdIdeas.push(ideaId);
      console.log(`✅ Created idea: ${idea.title}`);
    }

    console.log(`📊 Created ${createdIdeas.length} sample ideas`);
    console.log("🚀 Hackathon is ready with sample data!");

    return {
      message: "Hackathon data seeded successfully",
      ideasCreated: createdIdeas.length,
    };
  },
});

export const clearHackathonData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all hackathon data
    const ideas = await ctx.db.query("ideas").collect();
    const teams = await ctx.db.query("teams").collect();
    const ideaVotes = await ctx.db.query("ideaVotes").collect();
    const teamVotes = await ctx.db.query("teamVotes").collect();
    const hackathonUsers = await ctx.db.query("hackathonUsers").collect();

    for (const idea of ideas) {
      await ctx.db.delete(idea._id);
    }
    for (const team of teams) {
      await ctx.db.delete(team._id);
    }
    for (const vote of ideaVotes) {
      await ctx.db.delete(vote._id);
    }
    for (const vote of teamVotes) {
      await ctx.db.delete(vote._id);
    }
    for (const user of hackathonUsers) {
      await ctx.db.delete(user._id);
    }

    console.log("🗑️ Cleared all hackathon data");
    return {
      message: "Hackathon data cleared successfully",
      deleted: {
        ideas: ideas.length,
        teams: teams.length,
        ideaVotes: ideaVotes.length,
        teamVotes: teamVotes.length,
        hackathonUsers: hackathonUsers.length,
      },
    };
  },
});
