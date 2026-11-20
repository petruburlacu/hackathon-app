import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { isAdmin } from "./users";
import type { EventTimes } from "../lib/eventPhase";
import { REAL_EVENT_TIMES, testPhaseTimes } from "../lib/testPhase";

// Named loadEventTimes so it doesn't clash with the getEventTimes query below.
export async function loadEventTimes(ctx: QueryCtx): Promise<EventTimes> {
  const settings = await ctx.db.query("settings").first();
  return {
    eventStartAt: settings?.eventStartAt ?? REAL_EVENT_TIMES.eventStartAt,
    submissionsCloseAt:
      settings?.submissionsCloseAt ?? REAL_EVENT_TIMES.submissionsCloseAt,
    votingClosesAt: settings?.votingClosesAt ?? REAL_EVENT_TIMES.votingClosesAt,
  };
}

export const getEventTimes = query({
  args: {},
  handler: async (ctx): Promise<EventTimes> => {
    return await loadEventTimes(ctx);
  },
});

async function requireAdmin(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Not signed in");
  }
  if (!(await isAdmin(ctx, userId))) {
    throw new ConvexError("Admin access required");
  }
}

async function saveEventTimes(ctx: MutationCtx, times: EventTimes) {
  const existing = await ctx.db.query("settings").first();
  if (existing) {
    await ctx.db.patch(existing._id, { ...times, updatedAt: Date.now() });
    return existing._id;
  }
  // Mirror the env fallbacks createIdea/createTeam use when no settings doc exists.
  return await ctx.db.insert("settings", {
    enableIdeaSubmissions:
      (process.env.ENABLE_IDEA_SUBMISSIONS ??
        process.env.NEXT_PUBLIC_ENABLE_IDEA_SUBMISSIONS ??
        "true") !== "false",
    enableTeamSubmissions:
      (process.env.ENABLE_TEAM_SUBMISSIONS ??
        process.env.NEXT_PUBLIC_ENABLE_TEAM_SUBMISSIONS ??
        "true") !== "false",
    ...times,
    updatedAt: Date.now(),
  });
}

export const updateEventTimes = mutation({
  args: {
    eventStartAt: v.number(),
    submissionsCloseAt: v.number(),
    votingClosesAt: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (
      !Object.values(args).every(Number.isFinite) ||
      !(args.eventStartAt < args.submissionsCloseAt) ||
      !(args.submissionsCloseAt < args.votingClosesAt)
    ) {
      throw new ConvexError(
        "Times must be in order: start < submissions close < voting close",
      );
    }

    return await saveEventTimes(ctx, args);
  },
});

export const jumpToPhase = mutation({
  args: {
    phase: v.union(
      v.literal("before"),
      v.literal("submissions"),
      v.literal("voting"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await saveEventTimes(ctx, testPhaseTimes(args.phase, Date.now()));
  },
});
