"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { GalleryCard } from "@/convex/gallery";
import { HackathonNav } from "@/components/HackathonNav";
import { BallotBar } from "@/components/voting/BallotBar";
import { Cover } from "@/components/voting/Cover";
import { PointButtons } from "@/components/voting/PointButtons";
import type { EventTimes, Phase } from "@/lib/eventPhase";
import { useEventPhase } from "@/lib/useEventPhase";
import { formatUkDayTime } from "@/lib/ukTime";

function Intro({ phase, times }: { phase: Phase; times: EventTimes }) {
  if (phase === "voting") {
    return (
      <p className="text-cyan-100">
        You have 5, 4, 3, 2 and 1 points to give to five different projects. Tap
        a number on a project to give it those points; tap it again to take them
        back.
      </p>
    );
  }
  if (phase === "closed") {
    return (
      <p className="text-cyan-100">
        Voting has closed.{" "}
        <Link
          href="/hackathon/leaderboard"
          className="text-yellow-300 underline underline-offset-4"
        >
          See the final results
        </Link>
        .
      </p>
    );
  }
  return (
    <p className="text-cyan-100">
      Voting opens {formatUkDayTime(times.submissionsCloseAt)}. Until then you
      can read what teams have saved so far.
    </p>
  );
}

function SubmissionCard({
  card,
  voting,
}: {
  card: GalleryCard;
  voting: boolean;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-cyan-400/20 bg-black/40 backdrop-blur-xs">
      <Link
        href={`/hackathon/submissions/${card._id}`}
        className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-yellow-400"
      >
        <Cover url={card.coverUrl} title={card.title} />
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h2 className="text-lg font-bold text-yellow-300 group-hover:underline underline-offset-4">
            {card.title}
          </h2>
          <p className="text-sm text-gray-400">
            {card.teamName}
            {card.isMine && " · your team"}
          </p>
          <p className="mt-1 text-sm text-gray-200">{card.tagline}</p>
        </div>
      </Link>
      {voting && (
        <div className="px-4 pb-4">
          <PointButtons submissionId={card._id} isMine={card.isMine} />
        </div>
      )}
    </li>
  );
}

export default function SubmissionsPage() {
  const cards = useQuery(api.gallery.listSubmissions);
  const times = useQuery(api.eventClock.getEventTimes);
  const phase = useEventPhase(times);
  const voting = phase === "voting";

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="🗳️ SUBMISSIONS 🗳️" />
      {voting && <BallotBar />}
      {!cards || !times || !phase ? (
        <div className="flex flex-1 items-center justify-center text-xl text-yellow-400">
          Loading...
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-yellow-400 font-mono sm:text-3xl">
              Submissions
            </h1>
            <Intro phase={phase} times={times} />
          </div>
          {cards.length === 0 ? (
            <div className="rounded-xl border border-cyan-400/20 bg-black/40 p-10 text-center text-cyan-200">
              No submissions yet. They appear here once a team saves its
              write-up.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <SubmissionCard key={card._id} card={card} voting={voting} />
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
