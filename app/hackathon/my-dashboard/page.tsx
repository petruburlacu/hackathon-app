"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  StarIcon,
  AvatarIcon,
  TrashIcon,
  ExitIcon,
  PlusIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import Link from "next/link";

export default function MyDashboardPage() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const myVotesGiven = useQuery(api.hackathon.getMyVotesGiven) || { ideaVotes: 0, teamVotes: 0, total: 0 };

  const leaveTeam = useMutation(api.hackathon.leaveTeam);
  const deleteTeam = useMutation(api.hackathon.deleteTeam);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    try {
      await leaveTeam({});
      toast.success("Left team successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTeam({});
      toast.success("Team deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="👤 MY DASHBOARD 👤" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Summary */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">👤 Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">{myIdeas.length}</div>
                  <div className="text-gray-400">Ideas Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">
                    {myVotesGiven.total}
                  </div>
                  <div className="text-gray-400">Total Votes Given</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">
                    {myTeamDetails ? "1" : "0"}
                  </div>
                  <div className="text-gray-400">Teams Joined</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Ideas */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400 font-mono">💡 My Ideas</CardTitle>
                <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                  <Link href="/hackathon/ideas">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Submit New Idea
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myIdeas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💡</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">No Ideas Yet</h3>
                  <p className="text-cyan-200 mb-4">Start by submitting your first hackathon idea!</p>
                  <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                    <Link href="/hackathon/ideas">Submit Idea</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myIdeas.map((idea) => (
                    <div key={idea._id} className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-yellow-400 font-bold text-lg">{idea.title}</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-pink-500 text-white text-xs">{idea.votes} votes</Badge>
                        </div>
                      </div>
                      <p className="text-cyan-200 text-sm mb-3 line-clamp-3">{idea.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Submitted {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                        <Button asChild size="sm" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                          <Link href="/hackathon/ideas">View All Ideas</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Team */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">👥 My Team</CardTitle>
            </CardHeader>
            <CardContent>
              {!myTeamDetails ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Not in a Team</h3>
                  <p className="text-cyan-200 mb-4">Join a team or create your own to start collaborating!</p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white font-bold">
                      <Link href="/hackathon/teams">Browse Teams</Link>
                    </Button>
                    <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                      <Link href="/hackathon/teams">Create Team</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Team Info */}
                  <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-yellow-400 font-bold text-xl">{myTeamDetails.team.name}</h4>
                        {myTeamDetails.team.description && (
                          <p className="text-cyan-200 text-sm mt-1">{myTeamDetails.team.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-pink-500 text-white">{myTeamDetails.team.votes} votes</Badge>
                        <Badge className={`${myTeamDetails.team.isAssembled ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                          {myTeamDetails.team.isAssembled ? '✅ Assembled' : '⏳ Forming'}
                        </Badge>
                        {myTeamDetails.isLeader && (
                          <Badge className="bg-purple-500 text-white">👑 Leader</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Team Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-cyan-300">
                          {myTeamDetails.team.currentDevs}/{myTeamDetails.team.maxDevs}
                        </div>
                        <div className="text-xs text-gray-400">Developers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-cyan-300">
                          {myTeamDetails.team.currentNonDevs}/{myTeamDetails.team.maxNonDevs}
                        </div>
                        <div className="text-xs text-gray-400">Non-Developers</div>
                      </div>
                    </div>

                    {/* Team's Idea */}
                    {myTeamDetails.idea ? (
                      <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                        <h5 className="text-green-400 font-bold text-sm mb-1">Selected Idea:</h5>
                        <p className="text-green-300 text-sm">{myTeamDetails.idea.title}</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                        <p className="text-yellow-400 text-sm">No idea assigned yet</p>
                      </div>
                    )}

                    {/* Team Actions */}
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Link href="/hackathon/teams">View Team Details</Link>
                      </Button>
                      
                      {!myTeamDetails.isLeader ? (
                        <Button
                          size="sm"
                          onClick={handleLeaveTeam}
                          disabled={isLeaving}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <ExitIcon className="mr-1 h-4 w-4" />
                          {isLeaving ? "Leaving..." : "Leave Team"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleDeleteTeam}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <TrashIcon className="mr-1 h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete Team"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h5 className="text-cyan-300 font-bold text-sm mb-2">Team Members:</h5>
                    <div className="grid gap-2">
                      {myTeamDetails.members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between bg-black/10 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              member.role === 'dev' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
                            }`}>
                              {member.role === 'dev' ? '💻 Dev' : '🎨 Non-Dev'}
                            </span>
                            <span className="text-cyan-200 text-sm">
                              {member.userId === viewer._id ? "You" : "Anonymous"}
                            </span>
                          </div>
                          {member.userId === myTeamDetails.team.leaderId && (
                            <Badge className="bg-purple-500 text-white text-xs">Leader</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
