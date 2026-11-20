import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { isAdmin } from "./users";
import {
  DEFAULT_SUBMISSIONS_CLOSE,
  DEFAULT_VOTING_CLOSE,
  EVENT_START,
} from "../lib/event";
import type { EventTimes } from "../lib/eventPhase";

// Named loadEventTimes so it doesn't clash with the getEventTimes query below.
export async function loadEventTimes(ctx: QueryCtx): Promise<EventTimes> {
  const settings = await ctx.db.query("settings").first();
  return {
    eventStartAt: settings?.eventStartAt ?? EVENT_START.getTime(),
    submissionsCloseAt:
      settings?.submissionsCloseAt ?? DEFAULT_SUBMISSIONS_CLOSE.getTime(),
    votingClosesAt: settings?.votingClosesAt ?? DEFAULT_VOTING_CLOSE.getTime(),
  };
}

export const getEventTimes = query({
  args: {},
  handler: async (ctx): Promise<EventTimes> => {
    return await loadEventTimes(ctx);
  },
});

export const updateEventTimes = mutation({
  args: {
    eventStartAt: v.number(),
    submissionsCloseAt: v.number(),
    votingClosesAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }
    if (!(await isAdmin(ctx, userId))) {
      throw new ConvexError("Admin access required");
    }

    if (
      !Object.values(args).every(Number.isFinite) ||
      !(args.eventStartAt < args.submissionsCloseAt) ||
      !(args.submissionsCloseAt < args.votingClosesAt)
    ) {
      throw new ConvexError(
        "Times must be in order: start < submissions close < voting close",
      );
    }

    const current = await loadEventTimes(ctx);
    if (
      Date.now() >= current.submissionsCloseAt &&
      args.submissionsCloseAt > current.submissionsCloseAt
    ) {
      throw new ConvexError("Use reopen for a single team once voting has opened");
    }

    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
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
      ...args,
      updatedAt: Date.now(),
    });
  },
});
