"use client";

import { Leaderboard } from "@/app/hackathon/Leaderboard/Leaderboard";
import { UserMenu } from "@/components/UserMenu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

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
      <div className="flex items-start justify-between border-b border-cyan-400/20 p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-yellow-400 font-mono">
            🏆 LEADERBOARD 🏆
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/hackathon" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Dashboard
            </Link>
            <Link href="/hackathon/my-dashboard" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              My Dashboard
            </Link>
            <Link href="/hackathon/ideas" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Ideas
            </Link>
            <Link href="/hackathon/teams" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Teams
            </Link>
            <Link href="/hackathon/leaderboard" className="text-yellow-400 font-mono text-sm font-bold">
              Leaderboard
            </Link>
            <Link href="/hackathon/admin" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Admin
            </Link>
            <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Home
            </Link>
          </nav>
        </div>
        <UserMenu>{viewer.name}</UserMenu>
      </div>
      <Leaderboard />
    </main>
  );
}
