"use client";

import { HackathonOverview } from "./HackathonOverview/HackathonOverview";
import { HackathonNav } from "@/components/HackathonNav";
import { WelcomeTour } from "@/components/WelcomeTour";
import { PixelatedHammer } from "@/components/PixelatedHammer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
        <div className="text-yellow-400 text-xl hackathon-text">Loading...</div>
      </div>
    );
  }

  // Determine if user should see the tour (new users who haven't completed it)
  const shouldShowTour = hackathonUser && typeof window !== 'undefined' && !localStorage.getItem("hackathon-tour-completed");
  
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
      <HackathonNav 
        title="⚖️ TRIAL BY CODE ⚖️"
        showTour={true}
        onShowTour={() => setShowTour(true)}
      />
      
      {/* Judge's Hammer Decoration */}
      <div className="absolute top-32 right-8 z-10">
        <PixelatedHammer size="lg" animated={true} />
      </div>
      
      <HackathonOverview hackathonUser={hackathonUser || null} />
      
      {/* Welcome Tour */}
      <WelcomeTour
        isVisible={showTour || shouldShowTour || false}
        onClose={() => {
          setShowTour(false);
          // Don't mark as completed when manually closed - allow resuming
        }}
        userProgress={userProgress}
      />
    </main>
  );
}