"use client";

import { HackathonOverview } from "./HackathonOverview/HackathonOverview";
import { HackathonNav } from "@/components/HackathonNav";
import { WelcomeTour } from "@/components/WelcomeTour";
import { PixelatedHammer } from "@/components/PixelatedHammer";
import { FullScreenLoader } from "@/components/PixelatedLoader";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function HackathonPage() {
  const [showTour, setShowTour] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(false);
  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);

  if (!viewer) {
    return <FullScreenLoader text="Loading hackathon..." />;
  }

  // Determine if user should see the tour (new users who haven't completed it)
  // Only show automatically for users who haven't seen it before AND haven't manually closed it
  const hasCompletedTour = typeof window !== 'undefined' && localStorage.getItem("hackathon-tour-completed");
  const hasSeenTour = typeof window !== 'undefined' && localStorage.getItem("hackathon-tour-seen");
  const shouldShowTour = hackathonUser && !hasCompletedTour && !hasSeenTour && !tourDismissed;
  
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
          setTourDismissed(true);
          // Tour component handles localStorage marking internally
        }}
        userProgress={userProgress}
      />
    </main>
  );
}