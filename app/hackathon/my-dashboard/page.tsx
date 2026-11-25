"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import {
  TrashIcon,
  ExitIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import Link from "next/link";
import { TeamsLockedNotice } from "@/components/TeamsLockedNotice";
import { useTeamsLocked } from "@/lib/useTeamsLocked";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { plural } from "@/lib/plural";
import { MAX_TEAM_SIZE } from "@/lib/event";

export default function MyDashboardPage() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"leave" | "delete" | null>(null);

  const viewer = useQuery(api.users.viewer);
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const myVotesGiven = useQuery(api.hackathon.getMyVotesGiven) || { ideaVotes: 0 };
  const locked = useTeamsLocked();

  const leaveTeam = useMutation(api.hackathon.leaveTeam);
  const deleteTeam = useMutation(api.hackathon.deleteTeam);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading…</div>
      </div>
    );
  }

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    try {
      await leaveTeam({});
      toast.success("Left team successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to leave team"));
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      await deleteTeam({});
      toast.success("Team deleted successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete team"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="👤 MY DASHBOARD 👤" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Summary */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400 font-mono">👤 Profile Summary</CardTitle>
                <Button asChild variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                  <Link href="/hackathon/profile">Manage Profile</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">{myIdeas.length}</div>
                  <div className="text-gray-400">Ideas Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">
                    {myVotesGiven.ideaVotes}
                  </div>
                  <div className="text-gray-400">Idea Upvotes Given</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">
                    {myTeamDetails ? "Yes" : "No"}
                  </div>
                  <div className="text-gray-400">Team Joined</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Ideas */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
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
                  <p className="text-cyan-200">Start by submitting your first hackathon idea!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myIdeas.map((idea) => (
                    <div key={idea._id} className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-yellow-400 font-bold text-lg">{idea.title}</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-pink-500 text-white text-xs">{plural(idea.votes, "upvote")}</Badge>
                        </div>
                      </div>
                      <p className="text-cyan-200 text-sm mb-3 line-clamp-3">{idea.description}</p>
                      <span className="text-xs text-gray-400">
                        Submitted {new Date(idea.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Team */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">👥 My Team</CardTitle>
            </CardHeader>
            <CardContent>
              {!myTeamDetails ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Not in a Team</h3>
                  {locked ? (
                    <TeamsLockedNotice className="mx-auto mb-4 w-fit" />
                  ) : (
                    <p className="text-cyan-200 mb-4">Join a team or create your own to start collaborating!</p>
                  )}
                  <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                    <Link href="/hackathon/teams">{locked ? "Browse teams" : "Find or create a team"}</Link>
                  </Button>
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
                        <Badge className={`${myTeamDetails.team.isAssembled ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                          {myTeamDetails.team.isAssembled ? '✅ Assembled' : '⏳ Forming'}
                        </Badge>
                        {myTeamDetails.isLeader && (
                          <Badge className="bg-purple-500 text-white">👑 Leader</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Team Stats */}
                    <div className="mb-4">
                      <div className="text-lg font-bold text-cyan-300">
                        Members {myTeamDetails.team.currentDevs + myTeamDetails.team.currentNonDevs}/{MAX_TEAM_SIZE}
                      </div>
                      <div className="text-xs text-gray-400">
                        {plural(myTeamDetails.team.currentDevs, "developer")} · {plural(myTeamDetails.team.currentNonDevs, "non-developer")}
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
                    {locked && <TeamsLockedNotice className="mb-3" />}
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Link href={`/hackathon/teams/${myTeamDetails.team._id}`}>View Team Details</Link>
                      </Button>
                      
                      {locked ? null : !myTeamDetails.isLeader ? (
                        <Button
                          size="sm"
                          onClick={() => setConfirmAction("leave")}
                          disabled={isLeaving}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <ExitIcon className="mr-1 h-4 w-4" />
                          {isLeaving ? "Leaving…" : "Leave Team"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setConfirmAction("delete")}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <TrashIcon className="mr-1 h-4 w-4" />
                          {isDeleting ? "Deleting…" : "Delete Team"}
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
                              {member.userId === viewer._id ? "You" : member.userName}
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
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction === "delete" ? "Delete this team?" : "Leave this team?"}
        confirmLabel={confirmAction === "delete" ? "Delete team" : "Leave team"}
        tone="destructive"
        onConfirm={confirmAction === "delete" ? handleDeleteTeam : handleLeaveTeam}
      >
        <p>
          {confirmAction === "delete"
            ? "This removes the team for everyone. It can't be undone."
            : "You can join another team afterwards while teams are open."}
        </p>
      </ConfirmDialog>
    </main>
  );
}
