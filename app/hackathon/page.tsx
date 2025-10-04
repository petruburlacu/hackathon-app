"use client";

import { HackathonOverview } from "./HackathonOverview/HackathonOverview";
import { UserMenu } from "@/components/UserMenu";
import { WelcomeTour } from "@/components/WelcomeTour";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function HackathonPage() {
  const [showTour, setShowTour] = useState(false);
  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Simple admin check - in a real app, you'd have proper role-based access
  const isAdmin = viewer.email === "admin@hackathon.com";

  // Determine if user should see the tour (new users who haven't completed it)
  const shouldShowTour = hackathonUser && !localStorage.getItem("hackathon-tour-completed");
  
  // Calculate user progress for the tour
  const userProgress = {
    hasProfile: true,
    hasIdeas: myIdeas.length > 0,
    hasTeam: !!myTeamDetails,
    teamHasIdea: !!myTeamDetails?.idea,
    isComplete: myIdeas.length > 0 && !!myTeamDetails && !!myTeamDetails?.idea
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex items-start justify-between border-b border-cyan-400/20 p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-yellow-400 font-mono">
            🚀 HACKATHON 2024
          </div>
          {hackathonUser && (
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 text-sm">Role:</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                hackathonUser.role === 'dev' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-pink-500 text-white'
              }`}>
                {hackathonUser.role === 'dev' ? '💻 Developer' : '🎨 Non-Developer'}
              </span>
            </div>
          )}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/hackathon" className="text-yellow-400 font-mono text-sm font-bold">
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
            <Link href="/hackathon/leaderboard" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Leaderboard
            </Link>
            {isAdmin && (
              <Link href="/hackathon/admin" className="text-red-300 hover:text-red-400 transition-colors font-mono text-sm">
                Admin
              </Link>
            )}
            <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Home
            </Link>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <select 
              className="bg-black/30 border border-cyan-400/30 text-white rounded px-2 py-1 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  window.location.href = e.target.value;
                }
              }}
            >
              <option value="">Navigate...</option>
              <option value="/hackathon">Dashboard</option>
              <option value="/hackathon/my-dashboard">My Dashboard</option>
              <option value="/hackathon/ideas">Ideas</option>
              <option value="/hackathon/teams">Teams</option>
              <option value="/hackathon/leaderboard">Leaderboard</option>
              {isAdmin && <option value="/hackathon/admin">Admin</option>}
              <option value="/">Home</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTour(true)}
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs"
          >
            🎯 Take Tour
          </Button>
          <UserMenu>{viewer.name}</UserMenu>
        </div>
      </div>
      <HackathonOverview hackathonUser={hackathonUser || null} />
      
      {/* Welcome Tour */}
      <WelcomeTour
        isVisible={showTour || shouldShowTour}
        onClose={() => setShowTour(false)}
        userProgress={userProgress}
      />
    </main>
  );
}