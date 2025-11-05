"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StarIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Type for team object from the leaderboard
type Team = {
  _id: Id<"teams">;
  name: string;
  description?: string;
  leaderId: Id<"users">;
  ideaId?: Id<"ideas">;
  status?: "forming" | "idea-browsing" | "assembled" | "ready";
  isAssembled?: boolean;
  maxDevs: number;
  maxNonDevs: number;
  currentDevs: number;
  currentNonDevs: number;
  createdAt: number;
  votes: number;
};

export function Leaderboard() {
  const leaderboard = useQuery(api.hackathon.getLeaderboard) || [];
  const toggleTeamVote = useMutation(api.hackathon.toggleTeamVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);
  const [isVoting, setIsVoting] = useState<Id<"teams"> | null>(null);

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
      console.error("Uncaught error message:", event.error?.message);
      
      if (event.error?.message?.includes("only vote for one team")) {
        toast.error("You can only vote for one team! Please retract your existing team vote first.");
      } else if (event.error?.message?.includes("Not signed in")) {
        toast.error("Please sign in to vote");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      console.error("Rejection reason message:", event.reason?.message);
      
      if (event.reason?.message?.includes("only vote for one team")) {
        toast.error("You can only vote for one team! Please retract your existing team vote first.");
      } else if (event.reason?.message?.includes("Not signed in")) {
        toast.error("Please sign in to vote");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleToggleVote = async (teamId: Id<"teams">) => {
    if (isVoting === teamId) {
      console.log("Already voting for this team, ignoring click");
      return;
    }
    
    setIsVoting(teamId);
    
    console.log("Attempting to vote for team:", teamId);
    
    // Create a wrapper function to catch any errors
    const safeVote = async () => {
      try {
        const result = await toggleTeamVote({ teamId });
        return result;
      } catch (error) {
        console.error("Error in safeVote:", error);
        throw error;
      }
    };
    
    try {
      const result = await safeVote();
      console.log("Vote result:", result);
      
      if (result && typeof result === 'object' && 'action' in result) {
        if (result.action === "added") {
          toast.success("Vote recorded!");
        } else {
          toast.success("Vote retracted!");
        }
      }
    } catch (error: unknown) {
      console.error("Vote error caught:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error message:", errorMessage);
      console.error("Error type:", typeof error);
      
      if (errorMessage.includes("only vote for one team")) {
        toast.error("You can only vote for one team! Please retract your existing team vote first.");
      } else if (errorMessage.includes("Not signed in")) {
        toast.error("Please sign in to vote");
      } else if (errorMessage.includes("Team not found")) {
        toast.error("Team not found");
      } else {
        toast.error(errorMessage || "Failed to toggle vote");
      }
    } finally {
      setIsVoting(null);
    }
  };

  const hasVotedForTeam = (teamId: Id<"teams">) => {
    if (!voteStatus) {
      console.log("Vote status still loading...");
      return false; // Still loading
    }
    
    // Convert teamId to string to ensure proper comparison
    const teamIdStr = String(teamId);
    const hasVoted = voteStatus.teamVotes?.some((votedTeamId: Id<"teams">) => votedTeamId === teamId) || false;
    
    console.log(`Checking team ${teamIdStr}:`, {
      teamVotes: voteStatus.teamVotes,
      hasVoted: hasVoted
    });
    
    return hasVoted;
  };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 font-mono mb-3 sm:mb-4">
              🏆 TEAM LEADERBOARD 🏆
            </h1>
            <p className="text-cyan-200 text-base sm:text-lg">
              Vote for your favorite teams! Audience choice award goes to the most voted team!
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.map((team: Team, index: number) => (
            <Card 
              key={team._id} 
              className={`bg-black/40 backdrop-blur-sm border-cyan-400/20 transition-all hover:scale-[1.02] ${
                index === 0 ? 'border-yellow-400/60 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 
                index === 1 ? 'border-gray-400/60 bg-gradient-to-r from-gray-500/10 to-slate-500/10' :
                index === 2 ? 'border-orange-400/60 bg-gradient-to-r from-orange-500/10 to-red-500/10' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Rank */}
                    <div className={`text-3xl sm:text-4xl font-bold ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      index === 2 ? 'text-orange-400' : 'text-cyan-300'
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 font-mono mb-2">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-cyan-200 mb-3 text-sm sm:text-base">{team.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                        <span className="text-cyan-300">
                          👥 {team.currentDevs} devs, {team.currentNonDevs} non-devs
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          team.isAssembled ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {team.isAssembled ? '✅ Assembled' : '⏳ Forming'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vote Section */}
                  <div className="text-center sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
                      {team.votes}
                    </div>
                    <div className="text-sm text-gray-400 mb-3">votes</div>
                    <Button
                      size="sm"
                      onClick={() => handleToggleVote(team._id)}
                      disabled={isVoting === team._id}
                      className={`transition-all duration-300 transform hover:scale-105 py-2 px-4 ${
                        hasVotedForTeam(team._id)
                          ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 shadow-lg shadow-green-500/25"
                          : "bg-pink-500 hover:bg-pink-600 text-white border-2 border-pink-300 shadow-lg shadow-pink-500/25"
                      } ${isVoting === team._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <StarIcon className="mr-1 h-4 w-4" />
                      {isVoting === team._id ? "Voting..." : hasVotedForTeam(team._id) ? "Voted" : "Vote"}
                    </Button>
                  </div>
                </div>

                {/* Podium Badge */}
                {index < 3 && (
                  <div className="mt-4 text-center">
                    <Badge className={`text-lg px-4 py-2 ${
                      index === 0 ? 'bg-yellow-400 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-400 text-black'
                    }`}>
                      {index === 0 ? '🥇 1st Place' : 
                       index === 1 ? '🥈 2nd Place' : 
                       '🥉 3rd Place'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                No Teams Yet
              </h3>
              <p className="text-cyan-200 mb-6">
                Be the first to create a team and start competing!
              </p>
              <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                <a href="/hackathon">Create Team</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
