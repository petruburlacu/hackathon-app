import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  
  // Hackathon-specific tables
  hackathonUsers: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("dev"), v.literal("non-dev")),
    companyEmail: v.optional(v.string()),
    teamId: v.optional(v.id("teams")),
  }).index("by_user", ["userId"])
    .index("by_team", ["teamId"]),
  
  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.id("users"),
    createdAt: v.number(),
    votes: v.number(),
    isSelected: v.boolean(),
  }).index("by_author", ["authorId"])
    .index("by_votes", ["votes"])
    .index("by_selected", ["isSelected"]),
  
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    leaderId: v.id("users"),
    ideaId: v.optional(v.id("ideas")),
    status: v.optional(v.union(
      v.literal("forming"),
      v.literal("idea-browsing"),
      v.literal("assembled"),
      v.literal("ready")
    )),
    isAssembled: v.optional(v.boolean()), // Temporary field for migration
    maxDevs: v.number(),
    maxNonDevs: v.number(),
    currentDevs: v.number(),
    currentNonDevs: v.number(),
    createdAt: v.number(),
    votes: v.number(),
  }).index("by_leader", ["leaderId"])
    .index("by_votes", ["votes"])
    .index("by_status", ["status"])
    .index("by_idea", ["ideaId"]),
  
  ideaVotes: defineTable({
    ideaId: v.id("ideas"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_idea", ["ideaId"])
    .index("by_user", ["userId"])
    .index("by_idea_user", ["ideaId", "userId"]),
  
  teamVotes: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),
});
