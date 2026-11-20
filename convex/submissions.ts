import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { loadEventTimes } from "./eventClock";
import { getUsername, isAdmin } from "./users";
import { sanitizeText } from "../lib/sanitizeText";
import { isFresh } from "../lib/editLock";

export const MAX_VERSIONS = 5;
const MAX_CONTENT_BYTES = 200_000;
const MAX_TITLE_LENGTH = 80;
const MAX_TAGLINE_LENGTH = 140;

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
    const team = await ctx.db.get(teamId);
    const reopenedUntil = team?.submissionReopenedUntil;
    if (!(reopenedUntil !== undefined && now < reopenedUntil)) {
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
    if (lock && lock.userId !== userId && isFresh(lock.heartbeatAt, Date.now())) {
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

async function assertHoldsFreshLock(ctx: MutationCtx, userId: Id<"users">, teamId: Id<"teams">) {
  const lock = await getLockByTeam(ctx, teamId);
  if (!lock || lock.userId !== userId || !isFresh(lock.heartbeatAt, Date.now())) {
    throw new ConvexError("You no longer hold the edit lock");
  }
  return lock;
}

function cleanRequired(input: string, label: string, maxLength: number): string {
  const cleaned = sanitizeText(input, Number.MAX_SAFE_INTEGER);
  if (cleaned.length === 0) {
    throw new ConvexError(`${label} is required`);
  }
  if (cleaned.length > maxLength) {
    throw new ConvexError(`${label} must be ${maxLength} characters or fewer`);
  }
  return cleaned;
}

function assertValidContent(content: unknown): void {
  if (typeof content !== "object" || content === null || Array.isArray(content)) {
    throw new ConvexError("Content must be a document");
  }
  // v.any() admits ArrayBuffer and bigint, which JSON.stringify would drop or throw on.
  let json: string;
  try {
    json = JSON.stringify(content, (_key, value: unknown) => {
      if (value instanceof ArrayBuffer || typeof value === "bigint") throw new Error("not JSON");
      return value;
    });
  } catch {
    throw new ConvexError("Content must be a document");
  }
  if (new TextEncoder().encode(json).length > MAX_CONTENT_BYTES) {
    throw new ConvexError("Content is too large (200 KB max)");
  }
}

type SubmissionFields = {
  title: string;
  tagline: string;
  coverImageId?: Id<"_storage">;
  content: unknown;
};

// Writes summary + content, appends a version and prunes to MAX_VERSIONS in one transaction.
async function writeSubmission(
  ctx: MutationCtx,
  userId: Id<"users">,
  teamId: Id<"teams">,
  fields: SubmissionFields,
): Promise<Id<"submissions">> {
  const savedAt = Date.now();
  const summary = {
    title: fields.title,
    tagline: fields.tagline,
    coverImageId: fields.coverImageId,
    savedBy: userId,
    savedAt,
  };

  let submissionId: Id<"submissions">;
  const existing = await getSubmissionByTeam(ctx, teamId);
  if (existing) {
    submissionId = existing._id;
    await ctx.db.patch(submissionId, summary);
  } else {
    submissionId = await ctx.db.insert("submissions", {
      teamId,
      ...summary,
      totalPoints: 0,
      voterCount: 0,
    });
  }

  const contentRow = await ctx.db
    .query("submissionContent")
    .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
    .first();
  if (contentRow) {
    await ctx.db.patch(contentRow._id, { content: fields.content });
  } else {
    await ctx.db.insert("submissionContent", { submissionId, content: fields.content });
  }

  await ctx.db.insert("submissionVersions", { submissionId, ...summary, content: fields.content });
  const versions = await ctx.db
    .query("submissionVersions")
    .withIndex("by_submission_savedAt", (q) => q.eq("submissionId", submissionId))
    .order("desc")
    .collect();
  for (const old of versions.slice(MAX_VERSIONS)) {
    await ctx.db.delete(old._id);
  }

  return submissionId;
}

export const saveSubmission = mutation({
  args: {
    title: v.string(),
    tagline: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    content: v.any(),
  },
  handler: async (ctx, args): Promise<Id<"submissions">> => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    const lock = await assertHoldsFreshLock(ctx, userId, teamId);
    const title = cleanRequired(args.title, "Title", MAX_TITLE_LENGTH);
    const tagline = cleanRequired(args.tagline, "Tagline", MAX_TAGLINE_LENGTH);
    assertValidContent(args.content);
    const submissionId = await writeSubmission(ctx, userId, teamId, {
      title,
      tagline,
      coverImageId: args.coverImageId,
      content: args.content,
    });
    await ctx.db.patch(lock._id, { heartbeatAt: Date.now() });
    return submissionId;
  },
});

async function getContent(ctx: QueryCtx, submissionId: Id<"submissions">) {
  const row = await ctx.db
    .query("submissionContent")
    .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
    .first();
  return row?.content ?? null;
}

export const getMySubmission = query({
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
    const summary = await getSubmissionByTeam(ctx, teamId);
    if (!summary) {
      return null;
    }
    return { summary, content: await getContent(ctx, summary._id) };
  },
});

export const getSubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    if ((await getAuthUserId(ctx)) === null) {
      return null;
    }
    const summary = await ctx.db.get(args.submissionId);
    if (!summary) {
      return null;
    }
    const team = await ctx.db.get(summary.teamId);
    const idea = team?.ideaId ? await ctx.db.get(team.ideaId) : null;
    return {
      summary,
      content: await getContent(ctx, summary._id),
      teamName: team?.name ?? "Unknown team",
      idea: idea ? { title: idea.title, description: idea.description } : undefined,
    };
  },
});

async function getMyTeamVersion(ctx: QueryCtx, teamId: Id<"teams">, versionId: Id<"submissionVersions">) {
  const version = await ctx.db.get(versionId);
  const submission = version ? await ctx.db.get(version.submissionId) : null;
  if (!version || !submission || submission.teamId !== teamId) {
    throw new ConvexError("Version not found");
  }
  return version;
}

export const listVersions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const teamId = userId === null ? undefined : await getTeamIdOf(ctx, userId);
    const submission = teamId ? await getSubmissionByTeam(ctx, teamId) : null;
    if (!submission) {
      return [];
    }
    const versions = await ctx.db
      .query("submissionVersions")
      .withIndex("by_submission_savedAt", (q) => q.eq("submissionId", submission._id))
      .order("desc")
      .take(MAX_VERSIONS);
    return await Promise.all(
      versions.map(async (version) => ({
        _id: version._id,
        savedAt: version.savedAt,
        savedBy: await displayNameOf(ctx, version.savedBy),
        title: version.title,
      })),
    );
  },
});

export const getVersion = query({
  args: { versionId: v.id("submissionVersions") },
  handler: async (ctx, args) => {
    const { teamId } = await requireMyTeam(ctx);
    const version = await getMyTeamVersion(ctx, teamId, args.versionId);
    return { ...version, savedByName: await displayNameOf(ctx, version.savedBy) };
  },
});

export const restoreVersion = mutation({
  args: { versionId: v.id("submissionVersions") },
  handler: async (ctx, args): Promise<Id<"submissions">> => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    const lock = await assertHoldsFreshLock(ctx, userId, teamId);
    const version = await getMyTeamVersion(ctx, teamId, args.versionId);
    const submissionId = await writeSubmission(ctx, userId, teamId, {
      title: version.title,
      tagline: version.tagline,
      coverImageId: version.coverImageId,
      content: version.content,
    });
    await ctx.db.patch(lock._id, { heartbeatAt: Date.now() });
    return submissionId;
  },
});

export const adminReopenTeam = mutation({
  args: { teamId: v.id("teams"), until: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!(await isAdmin(ctx, userId))) {
      throw new ConvexError("Admin access required");
    }
    if (!Number.isFinite(args.until)) {
      throw new ConvexError("Pick a valid reopen time");
    }
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new ConvexError("Team not found");
    }
    await ctx.db.patch(team._id, { submissionReopenedUntil: args.until });
  },
});

export async function deleteSubmissionCascade(ctx: MutationCtx, teamId: Id<"teams">): Promise<void> {
  const lock = await getLockByTeam(ctx, teamId);
  if (lock) {
    await ctx.db.delete(lock._id);
  }
  const submission = await getSubmissionByTeam(ctx, teamId);
  if (!submission) {
    return;
  }
  const contentRows = await ctx.db
    .query("submissionContent")
    .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
    .collect();
  const versions = await ctx.db
    .query("submissionVersions")
    .withIndex("by_submission_savedAt", (q) => q.eq("submissionId", submission._id))
    .collect();
  for (const row of [...contentRows, ...versions]) {
    await ctx.db.delete(row._id);
  }
  // Extension point (Task 10): delete this submission's pointVotes here, before the summary row.
  await ctx.db.delete(submission._id);
}
