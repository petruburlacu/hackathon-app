"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BadgeIcon } from "@radix-ui/react-icons";

export function Leaderboard() {
  const leaderboard = useQuery(api.hackathon.getLeaderboard) || [];
  const voteForTeam = useMutation(api.hackathon.voteForTeam);

  const handleVoteTeam = async (teamId: string) => {
    try {
      await voteForTeam({ teamId });
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to vote for team");
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
          <CardContent className="p-8 text-center">
            <h1 className="text-4xl font-bold text-yellow-400 font-mono mb-4">
              🏆 TEAM LEADERBOARD 🏆
            </h1>
            <p className="text-cyan-200 text-lg">
              Vote for your favorite teams! The most popular teams win!
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.map((team, index) => (
            <Card 
              key={team._id} 
              className={`bg-black/40 backdrop-blur-sm border-cyan-400/20 transition-all hover:scale-[1.02] ${
                index === 0 ? 'border-yellow-400/60 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 
                index === 1 ? 'border-gray-400/60 bg-gradient-to-r from-gray-500/10 to-slate-500/10' :
                index === 2 ? 'border-orange-400/60 bg-gradient-to-r from-orange-500/10 to-red-500/10' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className={`text-4xl font-bold ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      index === 2 ? 'text-orange-400' : 'text-cyan-300'
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-yellow-400 font-mono mb-2">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-cyan-200 mb-3">{team.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
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
                  <div className="text-right">
                    <div className="text-3xl font-bold text-pink-400 mb-2">
                      {team.votes}
                    </div>
                    <div className="text-sm text-gray-400 mb-3">votes</div>
                    <Button
                      onClick={() => handleVoteTeam(team._id)}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-bold"
                    >
                      <BadgeIcon className="mr-2 h-4 w-4" />
                      Vote
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
