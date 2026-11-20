import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { loadEventTimes } from "./eventClock";
import { getUsername, isAdmin } from "./users";

export const LOCK_TTL_MS = 300_000;

function isFresh(lock: Doc<"editLocks">, now: number): boolean {
  return now - lock.heartbeatAt <= LOCK_TTL_MS;
}

async function requireUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Not signed in");
  }
  return userId;
}

async function getTeamIdOf(ctx: QueryCtx, userId: Id<"users">): Promise<Id<"teams"> | undefined> {
  const profile = await ctx.db
    .query("hackathonUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return profile?.teamId;
}

async function requireMyTeam(ctx: QueryCtx): Promise<{ userId: Id<"users">; teamId: Id<"teams"> }> {
  const userId = await requireUserId(ctx);
  const teamId = await getTeamIdOf(ctx, userId);
  if (!teamId) {
    throw new ConvexError("Not on this team");
  }
  return { userId, teamId };
}

async function getSubmissionByTeam(ctx: QueryCtx, teamId: Id<"teams">) {
  return await ctx.db
    .query("submissions")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .first();
}

async function getLockByTeam(ctx: QueryCtx, teamId: Id<"teams">) {
  return await ctx.db
    .query("editLocks")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .first();
}

export async function displayNameOf(ctx: QueryCtx, userId: Id<"users">): Promise<string> {
  const profile = await ctx.db
    .query("hackathonUsers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return profile?.displayName ?? (await getUsername(ctx, userId)) ?? "A teammate";
}

export async function assertCanEdit(
  ctx: MutationCtx,
  userId: Id<"users">,
  teamId: Id<"teams">,
): Promise<void> {
  if ((await getTeamIdOf(ctx, userId)) !== teamId) {
    throw new ConvexError("Not on this team");
  }
  const now = Date.now();
  const times = await loadEventTimes(ctx);
  if (now < times.eventStartAt && !(await isAdmin(ctx, userId))) {
    throw new ConvexError("Editing opens when the hackathon starts");
  }
  if (now >= times.submissionsCloseAt) {
    const submission = await getSubmissionByTeam(ctx, teamId);
    if (!(submission?.reopenedUntil !== undefined && now < submission.reopenedUntil)) {
      throw new ConvexError("Submissions are closed");
    }
  }
}

async function writeLock(ctx: MutationCtx, teamId: Id<"teams">, userId: Id<"users">) {
  const existing = await getLockByTeam(ctx, teamId);
  const heartbeatAt = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, { userId, heartbeatAt });
  } else {
    await ctx.db.insert("editLocks", { teamId, userId, heartbeatAt });
  }
}

export const acquireEditLock = mutation({
  args: {},
  handler: async (ctx): Promise<{ ok: true } | { ok: false; holder: string }> => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    const lock = await getLockByTeam(ctx, teamId);
    if (lock && lock.userId !== userId && isFresh(lock, Date.now())) {
      return { ok: false, holder: await displayNameOf(ctx, lock.userId) };
    }
    await writeLock(ctx, teamId, userId);
    return { ok: true };
  },
});

export const heartbeatEditLock = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    const lock = await getLockByTeam(ctx, teamId);
    if (!lock || lock.userId !== userId) {
      throw new ConvexError("You no longer hold the edit lock");
    }
    await ctx.db.patch(lock._id, { heartbeatAt: Date.now() });
  },
});

export const releaseEditLock = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, teamId } = await requireMyTeam(ctx);
    const lock = await getLockByTeam(ctx, teamId);
    if (lock && lock.userId === userId) {
      await ctx.db.delete(lock._id);
    }
  },
});

export const takeOverEditLock = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    await writeLock(ctx, teamId, userId);
  },
});

// Returns the raw lock row; the client decides freshness because queries don't re-run as time passes.
export const getMyEditState = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const teamId = await getTeamIdOf(ctx, userId);
    if (!teamId) {
      return null;
    }
    const submission = await getSubmissionByTeam(ctx, teamId);
    const lock = await getLockByTeam(ctx, teamId);
    return {
      teamId,
      submissionId: submission?._id,
      lock: lock
        ? {
            userId: lock.userId,
            displayName: await displayNameOf(ctx, lock.userId),
            heartbeatAt: lock.heartbeatAt,
          }
        : undefined,
    };
  },
});
