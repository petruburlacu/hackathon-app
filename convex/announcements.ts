import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { isAdmin } from "./users";
import { sanitizeMultilineText, sanitizeText } from "../lib/sanitizeText";

const TITLE_MAX = 120;
const BODY_MAX = 4000;

async function requireAdmin(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Not signed in");
  }
  if (!(await isAdmin(ctx, userId))) {
    throw new ConvexError("Admin access required");
  }
  return userId;
}

// Pinned first, then newest.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("announcements")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return [
      ...all.filter((a) => a.pinned),
      ...all.filter((a) => !a.pinned),
    ].map((a) => ({
      _id: a._id,
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      createdAt: a.createdAt,
    }));
  },
});

export const create = mutation({
  args: { title: v.string(), body: v.string(), pinned: v.boolean() },
  handler: async (ctx, args) => {
    const authorId = await requireAdmin(ctx);
    const title = sanitizeText(args.title, TITLE_MAX);
    const body = sanitizeMultilineText(args.body, BODY_MAX);
    if (title.length < 3) {
      throw new ConvexError("Title must be at least 3 characters");
    }
    if (body.length === 0) {
      throw new ConvexError("Announcement body cannot be empty");
    }
    return await ctx.db.insert("announcements", {
      title,
      body,
      pinned: args.pinned,
      authorId,
      createdAt: Date.now(),
    });
  },
});

export const setPinned = mutation({
  args: { announcementId: v.id("announcements"), pinned: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.announcementId, { pinned: args.pinned });
  },
});

export const remove = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.announcementId);
  },
});
