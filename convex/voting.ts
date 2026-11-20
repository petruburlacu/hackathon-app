import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { loadEventTimes } from "./eventClock";
import { getTeamIdOf, requireUserId } from "./submissions";

async function assertVotingOpen(ctx: MutationCtx): Promise<void> {
  const now = Date.now();
  const times = await loadEventTimes(ctx);
  if (now < times.submissionsCloseAt) {
    throw new ConvexError("Voting hasn't opened yet");
  }
  if (now >= times.votingClosesAt) {
    throw new ConvexError("Voting has closed");
  }
}

async function adjustTotals(
  ctx: MutationCtx,
  submissionId: Id<"submissions">,
  pointsDelta: number,
  votersDelta: number,
): Promise<void> {
  const totals = await ctx.db
    .query("submissionTotals")
    .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
    .first();
  if (!totals) {
    return;
  }
  await ctx.db.patch(totals._id, {
    totalPoints: totals.totalPoints + pointsDelta,
    voterCount: totals.voterCount + votersDelta,
  });
}

async function getVote(
  ctx: MutationCtx,
  voterId: Id<"users">,
  submissionId: Id<"submissions">,
) {
  return await ctx.db
    .query("pointVotes")
    .withIndex("by_voter_submission", (q) =>
      q.eq("voterId", voterId).eq("submissionId", submissionId),
    )
    .first();
}

export const givePoints = mutation({
  args: {
    submissionId: v.id("submissions"),
    points: v.number(),
    move: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: true } | { conflict: { title: string } }> => {
    const voterId = await requireUserId(ctx);
    await assertVotingOpen(ctx);
    const { points } = args;
    if (!Number.isInteger(points) || points < 1 || points > 5) {
      throw new ConvexError("Points must be 1 to 5");
    }
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new ConvexError("Submission not found");
    }
    // No profile or no team means "not on any team", so every submission is open to them.
    if ((await getTeamIdOf(ctx, voterId)) === submission.teamId) {
      throw new ConvexError("You can't vote for your own team");
    }

    const current = await getVote(ctx, voterId, submission._id);
    if (current?.points === points) {
      return { ok: true };
    }

    const sameValue = await ctx.db
      .query("pointVotes")
      .withIndex("by_voter_points", (q) =>
        q.eq("voterId", voterId).eq("points", points),
      )
      .first();
    if (sameValue) {
      const other = await ctx.db.get(sameValue.submissionId);
      if (other && !args.move) {
        return { conflict: { title: other.title } };
      }
      await ctx.db.delete(sameValue._id);
      await adjustTotals(ctx, sameValue.submissionId, -points, -1);
    }

    const updatedAt = Date.now();
    if (current) {
      await ctx.db.patch(current._id, { points, updatedAt });
      await adjustTotals(ctx, submission._id, points - current.points, 0);
    } else {
      await ctx.db.insert("pointVotes", {
        voterId,
        submissionId: submission._id,
        points,
        updatedAt,
      });
      await adjustTotals(ctx, submission._id, points, 1);
    }
    return { ok: true };
  },
});

export const removePoints = mutation({
  args: {
    submissionId: v.id("submissions"),
    // The value the voter saw; a stale ballot must not take back a vote changed elsewhere.
    points: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const voterId = await requireUserId(ctx);
    await assertVotingOpen(ctx);
    const vote = await getVote(ctx, voterId, args.submissionId);
    if (!vote || (args.points !== undefined && vote.points !== args.points)) {
      return;
    }
    await ctx.db.delete(vote._id);
    await adjustTotals(ctx, args.submissionId, -vote.points, -1);
  },
});

export const myBallot = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<
    Array<{ points: number; submissionId: Id<"submissions">; title: string }>
  > => {
    const voterId = await getAuthUserId(ctx);
    if (voterId === null) {
      return [];
    }
    const votes = await ctx.db
      .query("pointVotes")
      .withIndex("by_voter_points", (q) => q.eq("voterId", voterId))
      .order("desc")
      .collect();
    const ballot = await Promise.all(
      votes.map(async (vote) => {
        const submission = await ctx.db.get(vote.submissionId);
        return submission
          ? {
              points: vote.points,
              submissionId: vote.submissionId,
              title: submission.title,
            }
          : null;
      }),
    );
    return ballot.filter((entry) => entry !== null);
  },
});
