import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { requireUserId } from "./submissions";
import { isAdmin } from "./users";
import { toCsv } from "../lib/csv";
import { rankByPoints } from "../lib/ranking";

export type LeaderboardRow = {
  rank: number;
  submissionId: Id<"submissions">;
  title: string;
  teamName: string;
  coverUrl: string | null;
  totalPoints: number;
  voterCount: number;
};

async function loadBoard(ctx: QueryCtx): Promise<LeaderboardRow[]> {
  const submissions = await ctx.db
    .query("submissions")
    .withIndex("by_points")
    .order("desc")
    .collect();
  const rows = await Promise.all(
    submissions.map(async (submission) => {
      const team = await ctx.db.get(submission.teamId);
      return {
        submissionId: submission._id,
        title: submission.title,
        teamName: team?.name ?? "Unknown team",
        coverUrl: submission.coverImageId
          ? await ctx.storage.getUrl(submission.coverImageId)
          : null,
        totalPoints: submission.totalPoints,
        voterCount: submission.voterCount,
      };
    }),
  );
  return rankByPoints(rows);
}

export const get = query({
  args: {},
  handler: async (ctx): Promise<LeaderboardRow[]> => {
    if ((await getAuthUserId(ctx)) === null) {
      return [];
    }
    return await loadBoard(ctx);
  },
});

export const exportCsv = query({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await requireUserId(ctx);
    if (!(await isAdmin(ctx, userId))) {
      throw new ConvexError("Admin access required");
    }
    const board = await loadBoard(ctx);
    return toCsv(
      ["rank", "team", "title", "totalPoints", "voterCount"],
      board.map((row) => [
        row.rank,
        row.teamName,
        row.title,
        row.totalPoints,
        row.voterCount,
      ]),
    );
  },
});
