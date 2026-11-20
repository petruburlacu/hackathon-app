"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ballotSlots } from "@/lib/ballot";
import { formatUkDayTime } from "@/lib/ukTime";
import { cn } from "@/lib/utils";

const listOrNone = (values: number[]) =>
  values.length > 0 ? values.join(", ") : "none";

// Sits under the sticky nav, not at the bottom, so error toasts never cover it.
export function BallotBar() {
  const ballot = useQuery(api.voting.myBallot);
  const times = useQuery(api.eventClock.getEventTimes);

  if (!ballot || !times) {
    return null;
  }

  const slots = ballotSlots(ballot);
  const used = slots.filter((s) => s.holder).map((s) => s.points);
  const left = slots.filter((s) => !s.holder).map((s) => s.points);

  return (
    <div className="sticky top-16 md:top-20 z-[5] border-b border-yellow-400/20 bg-slate-950/85 backdrop-blur-sm px-3 py-2 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-yellow-400 font-mono">
            Your points
          </span>
          <ol className="flex gap-1" aria-label="Your points">
            {slots.map(({ points, holder }) => {
              const chip = cn(
                "flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-bold",
                holder
                  ? "bg-yellow-400 text-black"
                  : "border border-dashed border-cyan-400/40 text-cyan-300/70",
              );
              return (
                <li key={points}>
                  {holder ? (
                    <Link
                      href={`/hackathon/submissions/${holder.submissionId}`}
                      className={chip}
                      title={`${points} points on ${holder.title}`}
                      aria-label={`${points} points on ${holder.title}`}
                    >
                      {points}
                    </Link>
                  ) : (
                    <span className={chip} aria-label={`${points} points left`}>
                      {points}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="text-xs sm:text-sm text-gray-300">
          Used: <span className="text-white">{listOrNone(used)}</span>
          {" · "}
          Left: <span className="text-white">{listOrNone(left)}</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-400 sm:ml-auto">
          Voting closes {formatUkDayTime(times.votingClosesAt)}
        </div>
      </div>
    </div>
  );
}
