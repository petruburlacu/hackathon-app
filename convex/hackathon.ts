import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// User management functions
export const createHackathonUser = mutation({
  args: {
    role: v.union(v.literal("dev"), v.literal("non-dev")),
    companyEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
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
      companyEmail: args.companyEmail,
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

// Ideas functions
export const createIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
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

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    // For now, allow any authenticated user to admin delete
    // In a real app, you might want to check for admin role

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

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // For now, allow any authenticated user to admin delete
    // In a real app, you might want to check for admin role

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
          userName: user?.name || "Unknown",
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
          userName: user?.name || "Unknown",
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
