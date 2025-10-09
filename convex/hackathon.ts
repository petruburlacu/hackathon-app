import { getAuthUserId, getAuthSessionId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// User management functions
export const createHackathonUser = mutation({
  args: {
    role: v.union(v.literal("dev"), v.literal("non-dev"), v.literal("admin")),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get user info to check if they're admin
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only allow admin role for admin@hackathon.com
    if (args.role === "admin" && user.email !== "admin@hackathon.com") {
      throw new Error("Admin role can only be assigned to admin@hackathon.com");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      throw new Error("User already registered for hackathon");
    }

    return await ctx.db.insert("hackathonUsers", {
      userId,
      role: args.role,
      displayName: args.displayName,
    });
  },
});

export const getHackathonUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateHackathonUser = mutation({
  args: {
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser) {
      throw new Error("Hackathon user not found");
    }

    await ctx.db.patch(hackathonUser._id, {
      displayName: args.displayName,
    });
  },
});

// Ideas functions
export const createIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.optional(v.string()), // Made optional
    tags: v.optional(v.array(v.string())), // Made optional
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

        const ideaId = await ctx.db.insert("ideas", {
          title: args.title,
          description: args.description,
          authorId: userId,
          createdAt: Date.now(),
          votes: 0,
          isSelected: false,
          category: args.category || "Other",
          tags: args.tags || [],
        });

    return ideaId;
  },
});

export const getIdeas = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ideas")
      .withIndex("by_votes")
      .collect();
  },
});

export const updateIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    title: v.string(),
    description: v.string(),
    category: v.optional(v.string()), // Made optional
    tags: v.optional(v.array(v.string())), // Made optional
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    // Check if user is the author of the idea
    if (idea.authorId !== userId) {
      throw new Error("Only the idea author can edit their idea");
    }

    // Check if any teams are using this idea
    const teamsUsingIdea = await ctx.db
      .query("teams")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    if (teamsUsingIdea.length > 0) {
      throw new Error("Cannot edit idea that is being used by teams. Teams must first remove this idea.");
    }

        await ctx.db.patch(args.ideaId, {
          title: args.title,
          description: args.description,
          category: args.category || "Other",
          tags: args.tags || [],
        });
  },
});

export const voteForIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this idea
    const existingVote = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea_user", (q) => q.eq("ideaId", args.ideaId).eq("userId", userId))
      .first();

    if (existingVote) {
      throw new Error("You have already voted for this idea");
    }

    // Create vote record
    await ctx.db.insert("ideaVotes", {
      ideaId: args.ideaId,
      userId,
      createdAt: Date.now(),
    });

    // Update idea vote count
    const idea = await ctx.db.get(args.ideaId);
    if (idea) {
      await ctx.db.patch(args.ideaId, {
        votes: idea.votes + 1,
      });
    }
  },
});

export const toggleIdeaVote = mutation({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this idea
    const existingVote = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea_user", (q) => q.eq("ideaId", args.ideaId).eq("userId", userId))
      .first();

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    if (existingVote) {
      // User has voted, so retract the vote
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.ideaId, {
        votes: Math.max(0, idea.votes - 1),
      });
      return { action: "retracted", votes: Math.max(0, idea.votes - 1) };
    } else {
      // User hasn't voted, so add the vote
      await ctx.db.insert("ideaVotes", {
        ideaId: args.ideaId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.ideaId, {
        votes: idea.votes + 1,
      });
      return { action: "added", votes: idea.votes + 1 };
    }
  },
});

export const hasUserVotedForIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return false;
    }

    const existingVote = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea_user", (q) => q.eq("ideaId", args.ideaId).eq("userId", userId))
      .first();

    return !!existingVote;
  },
});

export const getUserVoteStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    console.log("getUserVoteStatus - userId:", userId);
    
    if (userId === null) {
      console.log("getUserVoteStatus - user not signed in");
      return { ideaVotes: [], teamVotes: [], suggestionVotes: [] };
    }

    // Get all votes for ideas
    const ideaVotes = await ctx.db
      .query("ideaVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get all votes for teams
    const teamVotes = await ctx.db
      .query("teamVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get all votes for suggestions
    const suggestionVotes = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const result = {
      ideaVotes: ideaVotes.map(vote => vote.ideaId),
      teamVotes: teamVotes.map(vote => vote.teamId),
      suggestionVotes: suggestionVotes.map(vote => vote.suggestionId),
    };

    console.log("getUserVoteStatus - result:", result);
    return result;
  },
});

export const deleteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    // Check if user is the author of the idea
    if (idea.authorId !== userId) {
      throw new Error("Only the idea author can delete their idea");
    }

    // Check if any teams are using this idea
    const teamsUsingIdea = await ctx.db
      .query("teams")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    if (teamsUsingIdea.length > 0) {
      throw new Error("Cannot delete idea that is being used by teams. Teams must first remove this idea.");
    }

    // Delete all votes for this idea
    const ideaVotes = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    for (const vote of ideaVotes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the idea
    await ctx.db.delete(args.ideaId);
  },
});

export const adminDeleteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get user info to check admin status
    const user = await ctx.db.get(userId);
    if (!user || user.email !== "admin@hackathon.com") {
      throw new Error("Admin access required");
    }

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    // Remove idea from any teams using it
    const teamsUsingIdea = await ctx.db
      .query("teams")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    for (const team of teamsUsingIdea) {
      await ctx.db.patch(team._id, {
        ideaId: undefined,
      });
    }

    // Delete all votes for this idea
    const ideaVotes = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    for (const vote of ideaVotes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the idea
    await ctx.db.delete(args.ideaId);
  },
});

// Teams functions
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    maxDevs: v.number(),
    maxNonDevs: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user is already in a team
    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser) {
      throw new Error("User not registered for hackathon");
    }

    if (hackathonUser.teamId) {
      throw new Error("User is already in a team");
    }

    // Check if user has already created a team
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_leader", (q) => q.eq("leaderId", userId))
      .first();

    if (existingTeam) {
      throw new Error("User has already created a team");
    }

    // Create team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      leaderId: userId,
      maxDevs: args.maxDevs,
      maxNonDevs: args.maxNonDevs,
      currentDevs: 0,
      currentNonDevs: 0,
      createdAt: Date.now(),
      votes: 0,
      status: "forming",
    });

    // Add creator to team
    await ctx.db.patch(hackathonUser._id, {
      teamId,
    });

    // Update team member counts
    await ctx.db.patch(teamId, {
      currentDevs: hackathonUser.role === "dev" ? 1 : 0,
      currentNonDevs: hackathonUser.role === "non-dev" ? 1 : 0,
    });

    return teamId;
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    maxDevs: v.number(),
    maxNonDevs: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get the team
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can update team details");
    }

    // Validate team name
    if (!args.name.trim()) {
      throw new Error("Team name cannot be empty");
    }

    if (args.name.trim().length < 3) {
      throw new Error("Team name must be at least 3 characters long");
    }

    // Validate member limits
    if (args.maxDevs < 1 || args.maxDevs > 2) {
      throw new Error("Max developers must be between 1 and 2");
    }

    if (args.maxNonDevs < 1 || args.maxNonDevs > 2) {
      throw new Error("Max non-developers must be between 1 and 2");
    }

    // Check if new limits would violate current member counts
    if (args.maxDevs < team.currentDevs) {
      throw new Error(`Cannot reduce max developers below current count (${team.currentDevs})`);
    }

    if (args.maxNonDevs < team.currentNonDevs) {
      throw new Error(`Cannot reduce max non-developers below current count (${team.currentNonDevs})`);
    }

    // Update the team
    await ctx.db.patch(args.teamId, {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      maxDevs: args.maxDevs,
      maxNonDevs: args.maxNonDevs,
    });

    return args.teamId;
  },
});

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_votes")
      .collect();
  },
});

export const joinTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser) {
      throw new Error("User not registered for hackathon");
    }

    if (hackathonUser.teamId) {
      throw new Error("User is already in a team");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if team has space for this role
    if (hackathonUser.role === "dev" && team.currentDevs >= team.maxDevs) {
      throw new Error("Team is full for developers");
    }

    if (hackathonUser.role === "non-dev" && team.currentNonDevs >= team.maxNonDevs) {
      throw new Error("Team is full for non-developers");
    }

    // Add user to team
    await ctx.db.patch(hackathonUser._id, {
      teamId: args.teamId,
    });

    // Update team member counts
    const newDevCount = hackathonUser.role === "dev" ? team.currentDevs + 1 : team.currentDevs;
    const newNonDevCount = hackathonUser.role === "non-dev" ? team.currentNonDevs + 1 : team.currentNonDevs;

    await ctx.db.patch(args.teamId, {
      currentDevs: newDevCount,
      currentNonDevs: newNonDevCount,
    });
  },
});

export const removeTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    memberUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can remove members");
    }

    // Don't allow removing the team leader
    if (args.memberUserId === team.leaderId) {
      throw new Error("Team leader cannot remove themselves");
    }

    // Find the member to remove
    const memberToRemove = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.memberUserId))
      .first();

    if (!memberToRemove || memberToRemove.teamId !== args.teamId) {
      throw new Error("Member not found in this team");
    }

    // Remove member from team
    await ctx.db.patch(memberToRemove._id, {
      teamId: undefined,
    });

    // Update team member counts
    const newDevCount = memberToRemove.role === "dev" ? team.currentDevs - 1 : team.currentDevs;
    const newNonDevCount = memberToRemove.role === "non-dev" ? team.currentNonDevs - 1 : team.currentNonDevs;

    await ctx.db.patch(args.teamId, {
      currentDevs: Math.max(0, newDevCount),
      currentNonDevs: Math.max(0, newNonDevCount),
    });
  },
});

export const assignIdeaToTeam = mutation({
  args: {
    teamId: v.id("teams"),
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can assign ideas");
    }

    // Update team with idea
    await ctx.db.patch(args.teamId, {
      ideaId: args.ideaId,
    });
  },
});

export const removeIdeaFromTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can remove ideas");
    }

    // Remove idea from team
    await ctx.db.patch(args.teamId, {
      ideaId: undefined,
    });
  },
});

export const voteForTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this team
    const existingVote = await ctx.db
      .query("teamVotes")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userId))
      .first();

    if (existingVote) {
      throw new Error("You have already voted for this team");
    }

    // Create vote record
    await ctx.db.insert("teamVotes", {
      teamId: args.teamId,
      userId,
      createdAt: Date.now(),
    });

    // Update team vote count
    const team = await ctx.db.get(args.teamId);
    if (team) {
      await ctx.db.patch(args.teamId, {
        votes: team.votes + 1,
      });
    }
  },
});

export const toggleTeamVote = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this team
    const existingVote = await ctx.db
      .query("teamVotes")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userId))
      .first();

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    if (existingVote) {
      // User has voted, so retract the vote
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.teamId, {
        votes: Math.max(0, team.votes - 1),
      });
      return { action: "retracted", votes: Math.max(0, team.votes - 1) };
    } else {
      // Check if user has already voted for another team (only 1 team vote allowed)
      const otherTeamVotes = await ctx.db
        .query("teamVotes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      if (otherTeamVotes.length > 0) {
        throw new Error("You can only vote for one team. Please retract your existing team vote first.");
      }

      // User hasn't voted, so add the vote
      await ctx.db.insert("teamVotes", {
        teamId: args.teamId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.teamId, {
        votes: team.votes + 1,
      });
      return { action: "added", votes: team.votes + 1 };
    }
  },
});

export const hasUserVotedForTeam = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return false;
    }

    const existingVote = await ctx.db
      .query("teamVotes")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userId))
      .first();

    return !!existingVote;
  },
});

export const leaveTeam = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser || !hackathonUser.teamId) {
      throw new Error("User is not in a team");
    }

    const team = await ctx.db.get(hackathonUser.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Don't allow team leader to leave (they should delete the team instead)
    if (team.leaderId === userId) {
      throw new Error("Team leaders cannot leave their team. Delete the team instead.");
    }

    // Remove user from team
    await ctx.db.patch(hackathonUser._id, {
      teamId: undefined,
    });

    // Update team member counts
    const newDevCount = hackathonUser.role === "dev" ? team.currentDevs - 1 : team.currentDevs;
    const newNonDevCount = hackathonUser.role === "non-dev" ? team.currentNonDevs - 1 : team.currentNonDevs;

    await ctx.db.patch(hackathonUser.teamId, {
      currentDevs: newDevCount,
      currentNonDevs: newNonDevCount,
    });
  },
});

export const deleteTeam = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser || !hackathonUser.teamId) {
      throw new Error("User is not in a team");
    }

    const team = await ctx.db.get(hackathonUser.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can delete their team");
    }

    // Remove all team members from the team
    const teamMembers = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.patch(member._id, {
        teamId: undefined,
      });
    }

    // Delete team votes
    const teamVotes = await ctx.db
      .query("teamVotes")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    for (const vote of teamVotes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the team
    await ctx.db.delete(team._id);
  },
});

export const adminDeleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Get user info to check admin status
    const user = await ctx.db.get(userId);
    if (!user || user.email !== "admin@hackathon.com") {
      throw new Error("Admin access required");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Remove all team members from the team
    const teamMembers = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.patch(member._id, {
        teamId: undefined,
      });
    }

    // Delete team votes
    const teamVotes = await ctx.db
      .query("teamVotes")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    for (const vote of teamVotes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the team
    await ctx.db.delete(team._id);
  },
});

export const getTeamsUsingIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_votes")
      .collect();

    return teams.sort((a, b) => b.votes - a.votes);
  },
});

export const getMyIdeas = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    return await ctx.db
      .query("ideas")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
  },
});

export const getMyTeamDetails = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const hackathonUser = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!hackathonUser || !hackathonUser.teamId) {
      return null;
    }

    const team = await ctx.db.get(hackathonUser.teamId);
    if (!team) {
      return null;
    }

    // Get team members
    const members = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          userName: member.displayName || user?.email || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      })
    );

    // Get team leader details
    const leader = await ctx.db.get(team.leaderId);

    // Get assigned idea details
    let idea = null;
    if (team.ideaId) {
      idea = await ctx.db.get(team.ideaId);
    }

    return {
      team,
      members: membersWithDetails,
      leader,
      idea,
      isLeader: team.leaderId === userId,
    };
  },
});

export const getMyVotesGiven = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { ideaVotes: 0, teamVotes: 0, total: 0 };
    }

    // Get user's idea votes
    const ideaVotes = await ctx.db
      .query("ideaVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get user's team votes
    const teamVotes = await ctx.db
      .query("teamVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      ideaVotes: ideaVotes.length,
      teamVotes: teamVotes.length,
      total: ideaVotes.length + teamVotes.length,
    };
  },
});

export const updateTeamStatus = mutation({
  args: {
    teamId: v.id("teams"),
    status: v.union(
      v.literal("forming"),
      v.literal("idea-browsing"),
      v.literal("assembled"),
      v.literal("ready")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leaderId !== userId) {
      throw new Error("Only team leaders can update team status");
    }

    await ctx.db.patch(args.teamId, {
      status: args.status,
    });
  },
});

export const getTeamDetails = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      return null;
    }

    // Get team members
    const members = await ctx.db
      .query("hackathonUsers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          userName: member.displayName || user?.email || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      })
    );

    // Get team leader details
    const leader = await ctx.db.get(team.leaderId);

    // Get assigned idea details
    let idea = null;
    if (team.ideaId) {
      idea = await ctx.db.get(team.ideaId);
    }

    return {
      team,
      members: membersWithDetails,
      leader,
      idea,
    };
  },
});

// Suggestions functions
export const createSuggestion = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("improvement"),
      v.literal("feature"),
      v.literal("bug"),
      v.literal("other")
    ),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    if (args.title.trim().length < 3) {
      throw new Error("Title must be at least 3 characters long");
    }

    if (args.description.trim().length < 10) {
      throw new Error("Description must be at least 10 characters long");
    }

    return await ctx.db.insert("suggestions", {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      authorId: userId,
      createdAt: Date.now(),
      votes: 0,
      isAnonymous: args.isAnonymous,
    });
  },
});

export const getSuggestions = query({
  args: {
    category: v.optional(v.union(
      v.literal("general"),
      v.literal("improvement"),
      v.literal("feature"),
      v.literal("bug"),
      v.literal("other")
    )),
    sortBy: v.optional(v.union(v.literal("newest"), v.literal("votes"), v.literal("title"))),
  },
  handler: async (ctx, args) => {
    let suggestions;

    // Filter by category if specified
    if (args.category) {
      suggestions = await ctx.db
        .query("suggestions")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      suggestions = await ctx.db
        .query("suggestions")
        .withIndex("by_created")
        .collect();
    }

    // Sort suggestions
    const sortBy = args.sortBy || "newest";
    suggestions.sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return suggestions;
  },
});

export const voteForSuggestion = mutation({
  args: {
    suggestionId: v.id("suggestions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this suggestion
    const existingVote = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion_user", (q) => q.eq("suggestionId", args.suggestionId).eq("userId", userId))
      .first();

    if (existingVote) {
      throw new Error("You have already voted for this suggestion");
    }

    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    // Create vote record
    await ctx.db.insert("suggestionVotes", {
      suggestionId: args.suggestionId,
      userId,
      createdAt: Date.now(),
    });

    // Update suggestion vote count
    await ctx.db.patch(args.suggestionId, {
      votes: suggestion.votes + 1,
    });
  },
});

export const toggleSuggestionVote = mutation({
  args: {
    suggestionId: v.id("suggestions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Check if user already voted for this suggestion
    const existingVote = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion_user", (q) => q.eq("suggestionId", args.suggestionId).eq("userId", userId))
      .first();

    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    if (existingVote) {
      // User has voted, so retract the vote
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(args.suggestionId, {
        votes: Math.max(0, suggestion.votes - 1),
      });
      return { action: "retracted", votes: Math.max(0, suggestion.votes - 1) };
    } else {
      // User hasn't voted, so add the vote
      await ctx.db.insert("suggestionVotes", {
        suggestionId: args.suggestionId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.suggestionId, {
        votes: suggestion.votes + 1,
      });
      return { action: "added", votes: suggestion.votes + 1 };
    }
  },
});

export const getMySuggestionVotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const votes = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return votes.map(vote => vote.suggestionId);
  },
});

export const deleteSuggestion = mutation({
  args: {
    suggestionId: v.id("suggestions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    // Only allow deletion by author or admin
    const user = await ctx.db.get(userId);
    if (suggestion.authorId !== userId && (!user || user.email !== "admin@hackathon.com")) {
      throw new Error("Only the author or admin can delete suggestions");
    }

    // Delete all votes for this suggestion
    const suggestionVotes = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion", (q) => q.eq("suggestionId", args.suggestionId))
      .collect();

    for (const vote of suggestionVotes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the suggestion
    await ctx.db.delete(args.suggestionId);
  },
});

// Session Management Functions
export const enforceSingleSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const currentSessionId = await getAuthSessionId(ctx);
    if (!currentSessionId) {
      throw new Error("No active session found");
    }

    // Get all active sessions for this user
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // If there are multiple sessions, delete all except the current one
    let sessionsDeleted = 0;
    for (const session of sessions) {
      if (session._id !== currentSessionId) {
        await ctx.db.delete(session._id);
        sessionsDeleted++;
      }
    }

    // Log the session enforcement for security monitoring
    console.log(`Security: Enforced single session for user ${userId}, deleted ${sessionsDeleted} concurrent sessions`);
    
    return { success: true, sessionsDeleted };
  },
});

export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const currentSessionId = await getAuthSessionId(ctx);
    if (!currentSessionId) {
      return [];
    }

    // Get all active sessions for this user
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return sessions.map(session => ({
      sessionId: session._id,
      createdAt: session._creationTime,
      isCurrent: session._id === currentSessionId,
    }));
  },
});

export const logoutAllSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get all active sessions for this user and delete them
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    let sessionsDeleted = 0;
    for (const session of sessions) {
      await ctx.db.delete(session._id);
      sessionsDeleted++;
    }

    console.log(`Security: User ${userId} logged out from all ${sessionsDeleted} sessions`);
    return { success: true, sessionsDeleted };
  },
});
