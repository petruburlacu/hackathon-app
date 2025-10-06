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
  role: "dev" | "non-dev" | "admin";
  companyEmail?: string;
  teamId?: string;
}

export function HackathonOverview({ hackathonUser }: { hackathonUser: HackathonUser | null | undefined }) {
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const leaderboard = useQuery(api.hackathon.getLeaderboard) || [];
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const myVotesGiven = useQuery(api.hackathon.getMyVotesGiven) || { ideaVotes: 0, teamVotes: 0, total: 0 };

  if (!hackathonUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 p-8">
          <CardContent className="text-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 hackathon-title">Registration Required</h3>
            <p className="text-cyan-200 mb-4 hackathon-text">
              You need to register for the hackathon to access this dashboard.
            </p>
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold hackathon-title">
              <Link href="/signin">Sign In / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topIdeas = ideas.slice(0, 3);
  const topTeams = leaderboard.slice(0, 3);
  const userTeam = teams.find((team: any) => team._id === hackathonUser.teamId);
  
  // Determine user state for personalized content
  const hasIdeas = myIdeas.length > 0;
  const hasTeam = !!myTeamDetails;
  const hasVotedForIdeas = myVotesGiven.ideaVotes > 0;
  const hasParticipated = hasIdeas || hasVotedForIdeas; // Combined participation check
  
  // Calculate user progress
  const userProgress = {
    hasProfile: true,
    hasParticipated,
    hasTeam,
    isComplete: hasParticipated && hasTeam
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Personalized Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4 hackathon-title">
            {userProgress.isComplete ? "🚀 Ready to Hack!" : 'Get Ready to Hack!'}
          </h1>
          <p className="text-xl text-cyan-200 mb-8 hackathon-text">
            {userProgress.isComplete ? "You're all set!" :
             hasTeam ? "Your team is getting ready. Keep participating!" :
             hasParticipated ? "Great participation! Now form or join a team." :
             "Enjoy the retro vibes! Participate actively or support by voting! 🎮✨"}
          </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Badge className={`px-4 py-2 text-lg hackathon-text ${
                      hackathonUser.role === 'dev' 
                        ? 'bg-blue-500 text-white' 
                        : hackathonUser.role === 'admin'
                        ? 'bg-red-500 text-white'
                        : 'bg-pink-500 text-white'
                    }`}>
                      {hackathonUser.role === 'dev' ? '💻 Developer' : 
                       hackathonUser.role === 'admin' ? '🚨 Admin' :
                       '🎨 Non-Developer'}
                    </Badge>
            {userTeam && (
              <Badge className="px-4 py-2 text-lg bg-green-500 text-white hackathon-text">
                👥 Team: {userTeam.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Checklist */}
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
            <BadgeIcon className="h-5 w-5" /> Your Hackathon Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasProfile ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasProfile ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasProfile ? '✓' : '1'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hackathon-text">Profile Setup</div>
                  <div className="text-xs text-gray-400 hackathon-text">Complete</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasParticipated ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasParticipated ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasParticipated ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hackathon-text">Engage With Ideas</div>
                  <div className="text-xs text-gray-400 hackathon-text">
                    {hasParticipated ? 
                      `${hasIdeas ? `${myIdeas.length} ideas` : ''}${hasIdeas && hasVotedForIdeas ? ', ' : ''}${hasVotedForIdeas ? `${myVotesGiven.ideaVotes} votes` : ''}` : 
                      'Not started'
                    }
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasTeam ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasTeam ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasTeam ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hackathon-text">Join Team</div>
                  <div className="text-xs text-gray-400 hackathon-text">{hasTeam ? 'Complete' : 'Not started'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <StarIcon className="h-5 w-5" /> Ideas Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">{ideas.length}</div>
              <p className="text-gray-400 text-sm hackathon-text">Total ideas in the pool</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <AvatarIcon className="h-5 w-5" /> Teams Formed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">{teams.length}</div>
              <p className="text-gray-400 text-sm hackathon-text">Teams ready to compete</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <BadgeIcon className="h-5 w-5" /> Total Votes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">
                {ideas.reduce((sum: number, idea: any) => sum + idea.votes, 0) + teams.reduce((sum: number, team: any) => sum + team.votes, 0)}
              </div>
              <p className="text-gray-400 text-sm hackathon-text">Votes cast across all</p>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Action Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Next Action Card */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
              <LightningBoltIcon className="h-5 w-5" /> Next Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasParticipated ? (
                <div>
                  <p className="text-cyan-200 mb-4 hackathon-text">Start participating! Submit ideas or vote for others!</p>
                  <div className="space-y-2">
                    <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold hackathon-title">
                      <Link href="/hackathon/ideas">Submit Ideas</Link>
                    </Button>
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-bold hackathon-title">
                      <Link href="/hackathon/ideas">Vote for Ideas</Link>
                    </Button>
                  </div>
                </div>
              ) : !hasTeam ? (
                <div>
                  <p className="text-cyan-200 mb-4 hackathon-text">Great participation! Now form or join a team.</p>
                  <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold hackathon-title">
                    <Link href="/hackathon/teams">Form/Join Team</Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-cyan-200 mb-4 hackathon-text">🎉 You&apos;re all set! Start building your project.</p>
                  <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-bold hackathon-title">
                    <Link href="/hackathon/my-dashboard">View My Dashboard</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browse & Vote Card - Always visible for non-participating users */}
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 hackathon-title flex items-center gap-2">
              <StarIcon className="h-5 w-5" /> Browse & Vote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-cyan-200 text-sm hackathon-text">
                  {!hasIdeas && !hasTeam ? 
                    "Not ready to participate? You can still browse and vote!" :
                    "Support the community by voting for ideas and teams!"
                  }
                </p>
                <div className="space-y-2">
                  <Button asChild size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white hackathon-text">
                    <Link href="/hackathon/ideas">Vote for Ideas</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white hackathon-text">
                    <Link href="/hackathon/leaderboard">Vote for Teams</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-purple-400 hackathon-title flex items-center gap-2">
              <RocketIcon className="h-5 w-5" /> Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white hackathon-text">
                  <Link href="/hackathon/leaderboard">View Leaderboard</Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-pink-500 hover:bg-pink-600 text-white hackathon-text">
                  <Link href="/hackathon/ideas">Browse All Ideas</Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white hackathon-text">
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
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
              <StarIcon className="h-5 w-5" /> Top Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {topIdeas.map((idea: any, index: number) => (
                  <div key={idea._id} className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-yellow-400 hackathon-title text-sm font-bold">#{index + 1}</h4>
                      <Badge className="bg-pink-500 text-white text-xs hackathon-text">{idea.votes} votes</Badge>
                    </div>
                    <h5 className="text-cyan-300 font-bold mb-2 hackathon-title">{idea.title}</h5>
                    <p className="text-gray-400 text-xs line-clamp-2 hackathon-text">{idea.description}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hackathon-text">
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
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
              <BadgeIcon className="h-5 w-5" /> Top Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {topTeams.map((team: any, index: number) => (
                  <div key={team._id} className={`p-4 rounded-lg border ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-400/30' :
                    'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`hackathon-title text-sm font-bold ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        'text-orange-400'
                      }`}>
                        #{index + 1}
                      </h4>
                      <Badge className="bg-pink-500 text-white text-xs hackathon-text">{team.votes} votes</Badge>
                    </div>
                    <h5 className="text-cyan-300 font-bold mb-2 hackathon-title">{team.name}</h5>
                    <p className="text-gray-400 text-xs hackathon-text">
                      {team.currentDevs} devs, {team.currentNonDevs} non-devs
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hackathon-text">
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
