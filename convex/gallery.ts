import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getTeamIdOf } from "./submissions";

export type GalleryCard = {
  _id: Id<"submissions">;
  title: string;
  tagline: string;
  teamName: string;
  coverUrl: string | null;
  isMine: boolean;
};

// Reads only the small summary rows: every vote re-runs this for every viewer.
export const listSubmissions = query({
  args: {},
  handler: async (ctx): Promise<GalleryCard[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }
    const myTeamId = await getTeamIdOf(ctx, userId);
    const submissions = await ctx.db.query("submissions").collect();
    const cards = await Promise.all(
      submissions.map(async (submission) => {
        const team = await ctx.db.get(submission.teamId);
        return {
          _id: submission._id,
          title: submission.title,
          tagline: submission.tagline,
          teamName: team?.name ?? "Unknown team",
          coverUrl: submission.coverImageId
            ? await ctx.storage.getUrl(submission.coverImageId)
            : null,
          isMine: myTeamId !== undefined && submission.teamId === myTeamId,
        };
      }),
    );
    return cards.sort((a, b) =>
      a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
    );
  },
});

// Takes the raw URL segment so a mistyped link shows "not found" instead of a validator error.
export const getSubmissionPage = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const submissionId = ctx.db.normalizeId("submissions", args.id);
    const summary = submissionId ? await ctx.db.get(submissionId) : null;
    if (!summary) {
      return null;
    }
    const [team, contentRow, myTeamId] = await Promise.all([
      ctx.db.get(summary.teamId),
      ctx.db
        .query("submissionContent")
        .withIndex("by_submission", (q) => q.eq("submissionId", summary._id))
        .first(),
      getTeamIdOf(ctx, userId),
    ]);
    const idea = team?.ideaId ? await ctx.db.get(team.ideaId) : null;
    return {
      _id: summary._id,
      title: summary.title,
      tagline: summary.tagline,
      savedAt: summary.savedAt,
      teamName: team?.name ?? "Unknown team",
      coverUrl: summary.coverImageId
        ? await ctx.storage.getUrl(summary.coverImageId)
        : null,
      content: contentRow?.content ?? null,
      idea: idea
        ? { title: idea.title, description: idea.description }
        : undefined,
      isMine: myTeamId !== undefined && summary.teamId === myTeamId,
    };
  },
});
