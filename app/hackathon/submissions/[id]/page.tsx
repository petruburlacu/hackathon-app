"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import type { JSONContent } from "@tiptap/react";
import { api } from "@/convex/_generated/api";
import { HackathonNav } from "@/components/HackathonNav";
import { SubmissionReader } from "@/components/submission/SubmissionReader";
import { BallotBar } from "@/components/voting/BallotBar";
import { Cover } from "@/components/voting/Cover";
import { PointButtons } from "@/components/voting/PointButtons";
import { useEventPhase } from "@/lib/useEventPhase";

function BackLink() {
  return (
    <Link
      href="/hackathon/submissions"
      className="inline-block text-sm text-cyan-300 hover:text-yellow-300"
    >
      ← All submissions
    </Link>
  );
}

export default function SubmissionReadPage() {
  const { id } = useParams<{ id: string }>();
  const submission = useQuery(api.gallery.getSubmissionPage, { id });
  const times = useQuery(api.eventClock.getEventTimes);
  const phase = useEventPhase(times);
  const voting = phase === "voting";

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="🗳️ SUBMISSIONS 🗳️" />
      {voting && <BallotBar />}
      {submission === undefined || !phase ? (
        <div className="flex flex-1 items-center justify-center text-xl text-yellow-400">
          Loading...
        </div>
      ) : submission === null ? (
        <div className="mx-auto mt-12 max-w-md space-y-4 rounded-xl border border-cyan-400/20 bg-black/40 p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-400">
            Submission not found
          </h1>
          <p className="text-gray-300">
            It may have been removed, or the link is wrong.
          </p>
          <BackLink />
        </div>
      ) : (
        <article className="mx-auto w-full max-w-3xl space-y-5 p-3 sm:p-6">
          <BackLink />
          <div className="overflow-hidden rounded-xl border border-cyan-400/20">
            <Cover url={submission.coverUrl} title={submission.title} />
          </div>
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
              {submission.title}
            </h1>
            <p className="text-sm text-gray-400">
              {submission.teamName}
              {submission.isMine && " · your team"}
            </p>
            <p className="pt-1 text-lg text-gray-100">{submission.tagline}</p>
          </header>
          {voting && (
            <section
              aria-label="Your points for this project"
              className="rounded-xl border border-yellow-400/30 bg-black/40 p-4"
            >
              <PointButtons
                submissionId={submission._id}
                isMine={submission.isMine}
              />
            </section>
          )}
          {submission.idea && (
            <details className="rounded-xl border border-cyan-400/20 bg-black/30 p-4 text-sm">
              <summary className="cursor-pointer text-cyan-200">
                Based on the idea:{" "}
                <span className="font-semibold text-yellow-300">
                  {submission.idea.title}
                </span>
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-gray-300">
                {submission.idea.description}
              </p>
            </details>
          )}
          <div className="rounded-xl border border-cyan-400/20 bg-black/40 p-4 sm:p-6">
            {submission.content ? (
              <SubmissionReader content={submission.content as JSONContent} />
            ) : (
              <p className="text-gray-400">This write-up is empty.</p>
            )}
          </div>
        </article>
      )}
    </main>
  );
}
