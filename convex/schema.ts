import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({}),
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  
  // Hackathon-specific tables
  hackathonUsers: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("dev"), v.literal("non-dev"), v.literal("admin")),
    displayName: v.optional(v.string()),
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
    category: v.optional(v.string()), // Made optional for migration
    tags: v.optional(v.array(v.string())), // Made optional for migration
  }).index("by_author", ["authorId"])
    .index("by_votes", ["votes"])
    .index("by_selected", ["isSelected"])
    .index("by_category", ["category"]),
  
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    leaderId: v.id("users"),
    ideaId: v.optional(v.id("ideas")),
    // When undefined, treat as true (open for random allocation by default)
    openForRandomAllocation: v.optional(v.boolean()),
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
    // Admin override: this team may keep editing its submission until this time, past the deadline.
    submissionReopenedUntil: v.optional(v.number()),
  }).index("by_leader", ["leaderId"])
    .index("by_status", ["status"])
    .index("by_idea", ["ideaId"]),
  
  ideaVotes: defineTable({
    ideaId: v.id("ideas"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_idea", ["ideaId"])
    .index("by_user", ["userId"])
    .index("by_idea_user", ["ideaId", "userId"]),
  
  suggestions: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("improvement"),
      v.literal("feature"),
      v.literal("bug"),
      v.literal("other")
    ),
    authorId: v.id("users"),
    createdAt: v.number(),
    votes: v.number(),
    isAnonymous: v.boolean(),
  }).index("by_author", ["authorId"])
    .index("by_votes", ["votes"])
    .index("by_category", ["category"])
    .index("by_created", ["createdAt"]),
  
  suggestionVotes: defineTable({
    suggestionId: v.id("suggestions"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_suggestion", ["suggestionId"])
    .index("by_user", ["userId"])
    .index("by_suggestion_user", ["suggestionId", "userId"]),
  
  // Site-wide settings (single document used)
  settings: defineTable({
    enableIdeaSubmissions: v.boolean(),
    enableTeamSubmissions: v.boolean(),
    updatedAt: v.number(),
    eventStartAt: v.optional(v.number()),
    submissionsCloseAt: v.optional(v.number()),
    votingClosesAt: v.optional(v.number()),
    officialEventStartAt: v.optional(v.number()),
    officialSubmissionsCloseAt: v.optional(v.number()),
    officialVotingClosesAt: v.optional(v.number()),
  }),

  // Kept small: the gallery and leaderboard subscribe to this table.
  submissions: defineTable({
    teamId: v.id("teams"),
    title: v.string(),
    tagline: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    savedBy: v.id("users"),
    savedAt: v.number(),
  }).index("by_team", ["teamId"]),

  // Split from `submissions` so a vote doesn't re-run the gallery and read-page queries.
  submissionTotals: defineTable({
    submissionId: v.id("submissions"),
    teamId: v.id("teams"),
    totalPoints: v.number(),
    voterCount: v.number(),
  }).index("by_submission", ["submissionId"])
    .index("by_points", ["totalPoints"]),

  submissionContent: defineTable({
    submissionId: v.id("submissions"),
    content: v.any(),
  }).index("by_submission", ["submissionId"]),

  // Keyed by team, not submission: the submission row only exists after the first Save.
  editLocks: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    heartbeatAt: v.number(),
  }).index("by_team", ["teamId"]),

  submissionVersions: defineTable({
    submissionId: v.id("submissions"),
    title: v.string(),
    tagline: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    content: v.any(),
    savedBy: v.id("users"),
    savedAt: v.number(),
  }).index("by_submission_savedAt", ["submissionId", "savedAt"]),

  // Every image file a team has uploaded: the 40-per-team cap, the ownership check and the delete cascade.
  submissionImages: defineTable({
    teamId: v.id("teams"),
    storageId: v.id("_storage"),
  }).index("by_team", ["teamId"])
    .index("by_storage", ["storageId"]),

  pointVotes: defineTable({
    voterId: v.id("users"),
    submissionId: v.id("submissions"),
    points: v.number(),
    updatedAt: v.number(),
  }).index("by_voter_points", ["voterId", "points"])
    .index("by_voter_submission", ["voterId", "submissionId"])
    .index("by_submission", ["submissionId"]),
});
