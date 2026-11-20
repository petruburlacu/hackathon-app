"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { HackathonNav } from "@/components/HackathonNav";
import { SubmissionWorkspace } from "@/components/submission/SubmissionWorkspace";
import { api } from "@/convex/_generated/api";

export default function SubmissionPage() {
  const viewer = useQuery(api.users.viewer);
  const teamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const editState = useQuery(api.submissions.getMyEditState);
  const saved = useQuery(api.submissions.getMySubmission);
  const times = useQuery(api.eventClock.getEventTimes);

  const loading =
    viewer === undefined ||
    teamDetails === undefined ||
    editState === undefined ||
    saved === undefined ||
    times === undefined;

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="📝 MY SUBMISSION 📝" />
      {loading || !viewer ? (
        <div className="flex flex-1 items-center justify-center text-xl text-yellow-400">
          Loading...
        </div>
      ) : !teamDetails || !editState ? (
        <div className="mx-auto mt-12 max-w-md rounded-xl border border-cyan-400/20 bg-black/40 p-8 text-center text-gray-100">
          <h1 className="text-2xl font-bold text-yellow-400">
            Join a team to submit
          </h1>
          <p className="mt-2 text-gray-300">
            Each team writes one submission. Join or create a team first.
          </p>
          <Link
            href="/hackathon/teams"
            className="mt-6 inline-block rounded-md bg-yellow-400 px-4 py-2 font-medium text-black hover:bg-yellow-300"
          >
            Go to Teams
          </Link>
        </div>
      ) : (
        <SubmissionWorkspace
          key={editState.teamId}
          teamId={editState.teamId}
          teamName={teamDetails.team.name}
          myUserId={viewer._id}
          isAdmin={viewer.isAdmin}
          times={times}
          reopenedUntil={teamDetails.team.submissionReopenedUntil}
          idea={
            teamDetails.idea
              ? {
                  title: teamDetails.idea.title,
                  description: teamDetails.idea.description,
                }
              : null
          }
          lock={editState.lock}
          saved={saved}
        />
      )}
    </main>
  );
}
