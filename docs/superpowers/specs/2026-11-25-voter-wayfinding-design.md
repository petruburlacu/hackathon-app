# Voter wayfinding

## Why

User feedback: "I land on page and am not sure if I need to enter hackathon to vote. I do enter, I scan header looking for Voting and can't find it."

Most of Opus 2 will vote rather than hack. The server only needs a sign-in to vote (`convex/voting.ts`), but every screen before the ballot is written for hackers.

## Goals

- A voter can tell from the landing page that they can vote without a team, and when voting opens.
- The header has a "Vote" item.
- Sign-up, profile setup and the tour don't imply you must join a team.
- A link to a protected page (e.g. `/hackathon/submissions` in the 4pm Slack post) survives sign-in.
- Idea votes are called "upvotes" so they aren't confused with the points vote.

## Non-goals

- Voter-only profile path (role stays required; schema untouched).
- Phase-aware nav, site-wide phase banner, merging dashboards.

## Approaches considered

1. **New phase-aware "Vote" nav item** (Ideas before voting, Submissions after). Rejected: teaches "Vote" = idea votes, then silently changes meaning.
2. **Rename "Submissions" to "Vote", same link.** Chosen: the page already explains "Voting opens…" before voting starts.

## Changes

1. Landing: hero line "Everyone at Opus 2 can vote, no team needed. Voting opens 4pm Thu 3 Dec." plus a hero CTA; bottom CTA "Hack or vote 🚀". Rules/info say "upvote" for ideas.
2. Nav: "Submissions" → "Vote"; "My submission" → "Our submission".
3. Profile gate: "Set up your profile" / "Continue"; hint that voters don't need a team.
4. Tour: correct the voting step and remove the team lock on it.
5. Sign-in: "Create account" instead of "Join Hackathon".
6. `?next=` through sign-in: proxy adds `next` when bouncing to `/signin`; sign-in page and the signed-in `/signin` redirect send the user there. Only same-origin relative paths are accepted (open-redirect guard, unit tested).
7. My submission after the deadline: link onward to voting.
8. Dashboard: teamless users get a "how to vote" prompt instead of "Join a team to submit" during submissions.
9. Idea votes renamed to "upvotes" in UI copy (not in schema/API names).
