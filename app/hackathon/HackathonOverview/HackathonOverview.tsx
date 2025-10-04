"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  StarIcon,
  AvatarIcon,
  BadgeIcon,
  RocketIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";

interface HackathonUser {
  _id: string;
  userId: string;
  role: "dev" | "non-dev";
  companyEmail?: string;
  teamId?: string;
}

export function HackathonOverview({ hackathonUser }: { hackathonUser: HackathonUser | null | undefined }) {
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const leaderboard = useQuery(api.hackathon.getLeaderboard) || [];
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);

  if (!hackathonUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 p-8">
          <CardContent className="text-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Registration Required</h3>
            <p className="text-cyan-200 mb-4">
              You need to register for the hackathon to access this dashboard.
            </p>
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              <Link href="/signin">Sign In / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topIdeas = ideas.slice(0, 3);
  const topTeams = leaderboard.slice(0, 3);
  const userTeam = teams.find(team => team._id === hackathonUser.teamId);
  
  // Determine user state for personalized content
  const hasIdeas = myIdeas.length > 0;
  const hasTeam = !!myTeamDetails;
  const isTeamLeader = myTeamDetails?.isLeader;
  const teamHasIdea = myTeamDetails?.idea;
  
  // Calculate user progress
  const userProgress = {
    hasProfile: true,
    hasIdeas,
    hasTeam,
    teamHasIdea,
    isComplete: hasIdeas && hasTeam && teamHasIdea
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Personalized Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4 font-mono">
            {userProgress.isComplete ? "🚀 Ready to Hack!" : 
             hasTeam ? "👥 Team Ready!" :
             hasIdeas ? "💡 Ideas Submitted!" :
             "Welcome to Hackathon 2024!"}
          </h1>
          <p className="text-xl text-cyan-200 mb-8">
            {userProgress.isComplete ? "Your team is assembled and ready to build!" :
             hasTeam ? "Your team is forming. Time to pick an idea!" :
             hasIdeas ? "Great ideas! Now form or join a team." :
             "Build the future with retro vibes! 🎮✨"}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className={`px-4 py-2 text-lg ${
              hackathonUser.role === 'dev' 
                ? 'bg-blue-500 text-white' 
                : 'bg-pink-500 text-white'
            }`}>
              {hackathonUser.role === 'dev' ? '💻 Developer' : '🎨 Non-Developer'}
            </Badge>
            {userTeam && (
              <Badge className="px-4 py-2 text-lg bg-green-500 text-white">
                👥 Team: {userTeam.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Checklist */}
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
              <BadgeIcon className="h-5 w-5" /> Your Hackathon Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasProfile ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasProfile ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasProfile ? '✓' : '1'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Profile Setup</div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasIdeas ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasIdeas ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasIdeas ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Submit Ideas</div>
                  <div className="text-xs text-gray-400">{hasIdeas ? `${myIdeas.length} submitted` : 'Not started'}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasTeam ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasTeam ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasTeam ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Join Team</div>
                  <div className="text-xs text-gray-400">{hasTeam ? 'Complete' : 'Not started'}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.teamHasIdea ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.teamHasIdea ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.teamHasIdea ? '✓' : '4'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Team Idea</div>
                  <div className="text-xs text-gray-400">{teamHasIdea ? 'Assigned' : hasTeam ? 'Pending' : 'N/A'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <StarIcon className="h-5 w-5" />
                Ideas Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-300">{ideas.length}</div>
              <p className="text-gray-400 text-sm">Total ideas in the pool</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <AvatarIcon className="h-5 w-5" />
                Teams Formed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-300">{teams.length}</div>
              <p className="text-gray-400 text-sm">Teams ready to compete</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <BadgeIcon className="h-5 w-5" />
                Total Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-300">
                {ideas.reduce((sum, idea) => sum + idea.votes, 0) + teams.reduce((sum, team) => sum + team.votes, 0)}
              </div>
              <p className="text-gray-400 text-sm">Votes cast across all</p>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Next Action Card */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <LightningBoltIcon className="h-5 w-5" /> Next Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasIdeas ? (
                <div>
                  <p className="text-cyan-200 mb-4">Start by submitting your innovative ideas!</p>
                  <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                    <Link href="/hackathon/ideas">Submit Your First Idea</Link>
                  </Button>
                </div>
              ) : !hasTeam ? (
                <div>
                  <p className="text-cyan-200 mb-4">Great ideas! Now form or join a team.</p>
                  <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold">
                    <Link href="/hackathon/teams">Form/Join Team</Link>
                  </Button>
                </div>
              ) : !teamHasIdea ? (
                <div>
                  <p className="text-cyan-200 mb-4">Your team needs to select an idea to work on.</p>
                  <Button asChild className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold">
                    <Link href="/hackathon/ideas">Browse Ideas</Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-cyan-200 mb-4">🎉 You're all set! Start building your project.</p>
                  <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
                    <Link href="/hackathon/my-dashboard">View My Dashboard</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Content Card */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono flex items-center gap-2">
                <StarIcon className="h-5 w-5" /> My Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-200">Ideas Submitted:</span>
                  <Badge className="bg-pink-500 text-white">{myIdeas.length}</Badge>
                </div>
                {hasTeam && (
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-200">Team:</span>
                    <Badge className="bg-green-500 text-white">{myTeamDetails?.team.name}</Badge>
                  </div>
                )}
                <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold">
                  <Link href="/hackathon/my-dashboard">Manage My Content</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-purple-400 font-mono flex items-center gap-2">
                <RocketIcon className="h-5 w-5" /> Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  <Link href="/hackathon/leaderboard">View Leaderboard</Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  <Link href="/hackathon/ideas">Browse All Ideas</Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                  <Link href="/hackathon/teams">Browse All Teams</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Ideas Preview */}
        {topIdeas.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <StarIcon className="h-5 w-5" />
                Top Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {topIdeas.map((idea, index) => (
                  <div key={idea._id} className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-yellow-400 font-mono text-sm font-bold">#{index + 1}</h4>
                      <Badge className="bg-pink-500 text-white text-xs">{idea.votes} votes</Badge>
                    </div>
                    <h5 className="text-cyan-300 font-bold mb-2">{idea.title}</h5>
                    <p className="text-gray-400 text-xs line-clamp-2">{idea.description}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  <Link href="/hackathon/ideas">View All Ideas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Teams Preview */}
        {topTeams.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <BadgeIcon className="h-5 w-5" />
                Top Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {topTeams.map((team, index) => (
                  <div key={team._id} className={`p-4 rounded-lg border ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-400/30' :
                    'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-mono text-sm font-bold ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        'text-orange-400'
                      }`}>
                        #{index + 1}
                      </h4>
                      <Badge className="bg-pink-500 text-white text-xs">{team.votes} votes</Badge>
                    </div>
                    <h5 className="text-cyan-300 font-bold mb-2">{team.name}</h5>
                    <p className="text-gray-400 text-xs">
                      {team.currentDevs} devs, {team.currentNonDevs} non-devs
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  <Link href="/hackathon/leaderboard">View Full Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
