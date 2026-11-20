"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LeaderboardRow } from "@/convex/leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { useEventPhase } from "@/lib/useEventPhase";
import { formatUkDayTime } from "@/lib/ukTime";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}

function Notice({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
      <CardContent className="p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 font-mono">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-cyan-200">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function Thumbnail({ row }: { row: LeaderboardRow }) {
  if (row.coverUrl) {
    return (
      <Image
        src={row.coverUrl}
        alt=""
        width={64}
        height={64}
        className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-lg object-cover border border-cyan-400/20"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-lg bg-linear-to-br from-cyan-500/40 to-purple-600/40 border border-cyan-400/20 flex items-center justify-center text-xl sm:text-2xl font-bold text-white/80"
    >
      {row.title.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}

function BoardRow({
  row,
  topTotal,
}: {
  row: LeaderboardRow;
  topTotal: number;
}) {
  const width = topTotal > 0 ? (row.totalPoints / topTotal) * 100 : 0;
  return (
    <li className="flex items-center gap-3 sm:gap-4 rounded-xl bg-black/30 border border-cyan-400/10 p-3 sm:p-4">
      <div
        className="w-10 shrink-0 text-center"
        aria-label={`Rank ${row.rank}`}
      >
        {MEDALS[row.rank] ? (
          <span className="text-3xl">{MEDALS[row.rank]}</span>
        ) : (
          <span className="text-lg font-bold font-mono text-cyan-300">
            #{row.rank}
          </span>
        )}
      </div>
      <Thumbnail row={row} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="min-w-0">
          <div className="truncate font-bold text-yellow-300">{row.title}</div>
          <div className="truncate text-sm text-gray-400">{row.teamName}</div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-yellow-400 to-pink-500 transition-[width] duration-500"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
      <div className="w-20 shrink-0 text-right">
        <div className="text-2xl font-bold font-mono text-white">
          {row.totalPoints}
        </div>
        <div className="text-xs text-gray-400">
          {row.voterCount} {row.voterCount === 1 ? "voter" : "voters"}
        </div>
      </div>
    </li>
  );
}

export function Leaderboard() {
  const times = useQuery(api.eventClock.getEventTimes);
  const board = useQuery(api.leaderboard.get);
  const phase = useEventPhase(times);

  if (!times || !board || !phase) {
    return (
      <Shell>
        <div className="text-center text-yellow-400 text-xl">Loading...</div>
      </Shell>
    );
  }

  if (phase === "before" || phase === "submissions") {
    return (
      <Shell>
        <Notice
          icon="🏆"
          title={`Voting opens ${formatUkDayTime(times.submissionsCloseAt)}`}
        />
      </Shell>
    );
  }

  const isFinal = phase === "closed";
  const topTotal = board[0]?.totalPoints ?? 0;

  return (
    <Shell>
      <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 font-mono">
              {isFinal ? "Final results" : "Live points"}
            </h1>
            {isFinal ? (
              <span className="text-sm text-gray-400">
                Voting closed {formatUkDayTime(times.votingClosesAt)}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Live · voting closes {formatUkDayTime(times.votingClosesAt)}
              </span>
            )}
          </div>
          {board.length === 0 ? (
            <p className="py-8 text-center text-cyan-200">
              No submissions yet.
            </p>
          ) : (
            <ol className="space-y-2 sm:space-y-3">
              {board.map((row) => (
                <BoardRow
                  key={row.submissionId}
                  row={row}
                  topTotal={topTotal}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
