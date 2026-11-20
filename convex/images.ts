import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { assertCanEdit, getImageRow, requireMyTeam } from "./submissions";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGES_PER_TEAM = 40;
const MAX_URL_LOOKUPS = 100;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const { userId, teamId } = await requireMyTeam(ctx);
    await assertCanEdit(ctx, userId, teamId);
    return await ctx.storage.generateUploadUrl();
  },
});

// Only what compressImage produces. An allowlist, so SVG (which can carry script) never gets through.
const ALLOWED_TYPES = new Set(["image/webp", "image/jpeg"]);

function isAllowedImage(contentType: string | undefined): boolean {
  const base = contentType?.split(";")[0].trim().toLowerCase();
  return base !== undefined && ALLOWED_TYPES.has(base);
}

type RegisterResult = { storageId: Id<"_storage"> } | { error: string };

// Returns the error instead of throwing: a throw would roll back the delete along with the rest of the mutation.
async function rejectAndDelete(ctx: MutationCtx, storageId: Id<"_storage">, error: string): Promise<RegisterResult> {
  await ctx.storage.delete(storageId);
  return { error };
}

export const registerUpload = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<RegisterResult> => {
    const { userId, teamId } = await requireMyTeam(ctx);
    const existing = await getImageRow(ctx, args.storageId);
    if (existing) {
      // Never delete a file that's already registered: it may be another team's.
      if (existing.teamId !== teamId) {
        throw new ConvexError("Upload not found");
      }
      return { storageId: args.storageId };
    }
    const file = await ctx.db.system.get("_storage", args.storageId);
    if (!file) {
      throw new ConvexError("Upload not found");
    }
    try {
      await assertCanEdit(ctx, userId, teamId);
    } catch (error) {
      if (error instanceof ConvexError && typeof error.data === "string") {
        return await rejectAndDelete(ctx, args.storageId, error.data);
      }
      throw error;
    }
    if (!isAllowedImage(file.contentType)) {
      return await rejectAndDelete(ctx, args.storageId, "Only image files can be uploaded");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return await rejectAndDelete(ctx, args.storageId, "Image is over 2 MB after compression");
    }
    const registered = await ctx.db
      .query("submissionImages")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .take(MAX_IMAGES_PER_TEAM);
    if (registered.length >= MAX_IMAGES_PER_TEAM) {
      return await rejectAndDelete(
        ctx,
        args.storageId,
        `Your team has reached the limit of ${MAX_IMAGES_PER_TEAM} images.`,
      );
    }
    await ctx.db.insert("submissionImages", { teamId, storageId: args.storageId });
    return { storageId: args.storageId };
  },
});

const ORPHAN_AGE_MS = 60 * 60 * 1000;
const SWEEP_BATCH = 200;

// Uploads that never reached registerUpload (closed tab, failed call). Safe because every file in
// storage is a submission image; anything else stored here later needs a row or it gets swept.
// Walks _storage in batches,
// chaining itself with a cursor so each mutation stays small.
export const deleteOrphanUploads = internalMutation({
  args: { cursor: v.optional(v.string()), cutoff: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cutoff = args.cutoff ?? Date.now() - ORPHAN_AGE_MS;
    const page = await ctx.db.system
      .query("_storage")
      .withIndex("by_creation_time", (q) => q.lt("_creationTime", cutoff))
      .paginate({ cursor: args.cursor ?? null, numItems: SWEEP_BATCH });
    for (const file of page.page) {
      if (!(await getImageRow(ctx, file._id))) {
        await ctx.storage.delete(file._id);
      }
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.images.deleteOrphanUploads, {
        cursor: page.continueCursor,
        cutoff,
      });
    }
  },
});

// Only resolves registered uploads, so this can't be used to mint URLs for arbitrary files.
export const getImageUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args): Promise<Record<string, string | null>> => {
    if ((await getAuthUserId(ctx)) === null) {
      return {};
    }
    if (args.storageIds.length > MAX_URL_LOOKUPS) {
      throw new ConvexError("Too many images requested");
    }
    const urls: Record<string, string | null> = {};
    for (const storageId of args.storageIds) {
      urls[storageId] = (await getImageRow(ctx, storageId)) ? await ctx.storage.getUrl(storageId) : null;
    }
    return urls;
  },
});
