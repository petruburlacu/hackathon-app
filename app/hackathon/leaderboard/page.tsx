"use client";

import { Leaderboard } from "@/app/hackathon/Leaderboard/Leaderboard";
import { HackathonNav } from "@/components/HackathonNav";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function LeaderboardPage() {
  const viewer = useQuery(api.users.viewer);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="🏆 LEADERBOARD 🏆" />
      <Leaderboard />
    </main>
  );
}
