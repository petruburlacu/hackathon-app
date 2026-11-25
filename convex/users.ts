import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, query, type QueryCtx } from "./_generated/server";

// Unset means no admins: a built-in default username could be claimed by
// whoever signs up with it first.
function adminUsernames(): string[] {
  return (process.env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUsername(username: string | null): boolean {
  return username !== null && adminUsernames().includes(username.toLowerCase());
}

export async function getUsername(
  ctx: Pick<QueryCtx, "runQuery">,
  userId: Id<"users">,
): Promise<string | null> {
  return await ctx.runQuery(components.authUsername.public.getUsername, {
    userId,
  });
}

export async function isAdmin(
  ctx: Pick<QueryCtx, "runQuery">,
  userId: Id<"users">,
): Promise<boolean> {
  return isAdminUsername(await getUsername(ctx, userId));
}

export const createUser = internalMutation({
  args: {
    method: v.object({
      name: v.literal("usernamePassword"),
      profile: v.object({}),
    }),
  },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", {});
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (user === null) {
      return null;
    }
    const username = await getUsername(ctx, userId);
    return { ...user, username, isAdmin: isAdminUsername(username) };
  },
});
