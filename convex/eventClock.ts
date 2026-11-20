import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { isAdmin } from "./users";
import type { EventTimes } from "../lib/eventPhase";
import { DEFAULT_EVENT_TIMES, isValidEventTimes, testPhaseTimes } from "../lib/testPhase";

function eventDatesFrom(settings: Doc<"settings"> | null): EventTimes {
  return {
    eventStartAt: settings?.officialEventStartAt ?? DEFAULT_EVENT_TIMES.eventStartAt,
    submissionsCloseAt:
      settings?.officialSubmissionsCloseAt ?? DEFAULT_EVENT_TIMES.submissionsCloseAt,
    votingClosesAt: settings?.officialVotingClosesAt ?? DEFAULT_EVENT_TIMES.votingClosesAt,
  };
}

export async function loadEventDates(ctx: QueryCtx): Promise<EventTimes> {
  return eventDatesFrom(await ctx.db.query("settings").first());
}

// The live clock the app enforces. Named loadEventTimes so it doesn't clash with the getEventTimes query.
export async function loadEventTimes(ctx: QueryCtx): Promise<EventTimes> {
  const settings = await ctx.db.query("settings").first();
  const dates = eventDatesFrom(settings);
  return {
    eventStartAt: settings?.eventStartAt ?? dates.eventStartAt,
    submissionsCloseAt: settings?.submissionsCloseAt ?? dates.submissionsCloseAt,
    votingClosesAt: settings?.votingClosesAt ?? dates.votingClosesAt,
  };
}

export const getEventTimes = query({
  args: {},
  handler: async (ctx): Promise<EventTimes> => {
    return await loadEventTimes(ctx);
  },
});

export const getEventDates = query({
  args: {},
  handler: async (ctx): Promise<EventTimes> => {
    return await loadEventDates(ctx);
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

type ClockFields = EventTimes & {
  officialEventStartAt?: number;
  officialSubmissionsCloseAt?: number;
  officialVotingClosesAt?: number;
};

const eventTimesArgs = {
  eventStartAt: v.number(),
  submissionsCloseAt: v.number(),
  votingClosesAt: v.number(),
};

function requireValidOrder(times: EventTimes) {
  if (!isValidEventTimes(times)) {
    throw new ConvexError(
      "Times must be in order: start < submissions close < voting close",
    );
  }
}

async function saveEventTimes(ctx: MutationCtx, times: ClockFields) {
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
  args: eventTimesArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    requireValidOrder(args);
    return await saveEventTimes(ctx, args);
  },
});

// Saving the event dates also puts the live clock on them.
export const saveEventDates = mutation({
  args: eventTimesArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    requireValidOrder(args);
    return await saveEventTimes(ctx, {
      ...args,
      officialEventStartAt: args.eventStartAt,
      officialSubmissionsCloseAt: args.submissionsCloseAt,
      officialVotingClosesAt: args.votingClosesAt,
    });
  },
});

export const resetToEventDates = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await saveEventTimes(ctx, await loadEventDates(ctx));
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
