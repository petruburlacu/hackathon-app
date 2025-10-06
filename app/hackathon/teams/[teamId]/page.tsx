"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  AvatarIcon,
  StarIcon,
  ArrowLeftIcon,
  RocketIcon,
  Pencil1Icon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    maxDevs: 2,
    maxNonDevs: 2,
  });

  const viewer = useQuery(api.users.viewer);
  const teamDetails = useQuery(api.hackathon.getTeamDetails, { teamId });
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);

  const updateTeamStatus = useMutation(api.hackathon.updateTeamStatus);
  const removeTeamMember = useMutation(api.hackathon.removeTeamMember);
  const updateTeam = useMutation(api.hackathon.updateTeam);

  // Update edit form when team details load
  React.useEffect(() => {
    if (teamDetails?.team) {
      setEditForm({
        name: teamDetails.team.name,
        description: teamDetails.team.description || "",
        maxDevs: teamDetails.team.maxDevs,
        maxNonDevs: teamDetails.team.maxNonDevs,
      });
    }
  }, [teamDetails]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (teamDetails?.team) {
      setEditForm({
        name: teamDetails.team.name,
        description: teamDetails.team.description || "",
        maxDevs: teamDetails.team.maxDevs,
        maxNonDevs: teamDetails.team.maxNonDevs,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    if (editForm.name.trim().length < 3) {
      toast.error("Team name must be at least 3 characters long");
      return;
    }

    try {
      await updateTeam({
        teamId: teamId as any,
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        maxDevs: editForm.maxDevs,
        maxNonDevs: editForm.maxNonDevs,
      });
      setIsEditing(false);
      toast.success("Team updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update team");
    }
  };

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-red-400 text-xl">Team not found</div>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateTeamStatus({ teamId, status: newStatus as any });
      toast.success("Team status updated successfully!");
    } catch (error) {
      toast.error("Failed to update team status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) {
      return;
    }

    try {
      await removeTeamMember({ teamId, memberUserId: memberUserId as any });
      toast.success("Member removed from team successfully!");
    } catch (error: any) {
      if (error.message?.includes("Only team leaders can remove members")) {
        toast.error("Only team leaders can remove members");
      } else if (error.message?.includes("Team leader cannot remove themselves")) {
        toast.error("Team leader cannot remove themselves");
      } else {
        toast.error("Failed to remove member from team");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "forming": return "bg-yellow-500 text-black";
      case "idea-browsing": return "bg-blue-500 text-white";
      case "assembled": return "bg-green-500 text-white";
      case "ready": return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "forming": return "⏳ Forming";
      case "idea-browsing": return "🔍 Idea Browsing";
      case "assembled": return "✅ Assembled";
      case "ready": return "🚀 Ready";
      default: return "❓ Unknown";
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="👥 TEAM DETAILS 👥" />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
              <Link href="/hackathon/teams">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Teams
              </Link>
            </Button>
          </div>

          {/* Team Header */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-cyan-300 mb-2 block">Team Name *</label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 text-2xl font-mono"
                          placeholder="Enter team name..."
                        />
                      </div>
                      <div>
                        <label className="text-sm text-cyan-300 mb-2 block">Team Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-lg"
                          placeholder="Describe your team's vision and goals..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-cyan-300 mb-2 block">Max Developers</label>
                          <Select 
                            value={editForm.maxDevs.toString()} 
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, maxDevs: parseInt(value) }))}
                          >
                            <SelectTrigger className="bg-black/20 border-cyan-400/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                              <SelectItem value="1">1 Developer</SelectItem>
                              <SelectItem value="2">2 Developers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-cyan-300 mb-2 block">Max Non-Developers</label>
                          <Select 
                            value={editForm.maxNonDevs.toString()} 
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, maxNonDevs: parseInt(value) }))}
                          >
                            <SelectTrigger className="bg-black/20 border-cyan-400/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                              <SelectItem value="1">1 Non-Developer</SelectItem>
                              <SelectItem value="2">2 Non-Developers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                        >
                          <Cross2Icon className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-yellow-400 font-mono text-3xl">
                          {teamDetails.team.name}
                        </CardTitle>
                        {hackathonUser?.userId === teamDetails.team.leaderId && (
                          <Button
                            onClick={handleStartEdit}
                            size="sm"
                            variant="outline"
                            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {teamDetails.team.description && (
                        <p className="text-cyan-200 text-lg">{teamDetails.team.description}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-pink-500 text-white text-lg px-3 py-1">
                    {teamDetails.team.votes} votes
                  </Badge>
                  <Badge className={`${getStatusColor(teamDetails.team.status || "forming")} text-lg px-3 py-1`}>
                    {getStatusText(teamDetails.team.status || "forming")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Team Stats */}
                <div className="space-y-4">
                  <h3 className="text-cyan-300 font-bold text-lg">Team Composition</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                      <div className="text-2xl font-bold text-blue-400">
                        {teamDetails.team.currentDevs}/{teamDetails.team.maxDevs}
                      </div>
                      <div className="text-sm text-gray-400">Developers</div>
                    </div>
                    <div className="text-center p-3 bg-pink-500/10 rounded-lg border border-pink-400/20">
                      <div className="text-2xl font-bold text-pink-400">
                        {teamDetails.team.currentNonDevs}/{teamDetails.team.maxNonDevs}
                      </div>
                      <div className="text-sm text-gray-400">Non-Developers</div>
                    </div>
                  </div>
                </div>

                {/* Team Leader */}
                <div className="space-y-4">
                  <h3 className="text-cyan-300 font-bold text-lg">Team Leader</h3>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">👑</span>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">{teamDetails.leader.name}</div>
                        <div className="text-gray-400 text-sm">{teamDetails.leader.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">👥 Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {teamDetails.members.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-cyan-400/10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.role === 'dev' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}>
                      <span className="text-white font-bold">
                        {member.role === 'dev' ? '💻' : '🎨'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-cyan-300 font-bold">{member.userName}</div>
                      <div className="text-gray-400 text-sm">{member.userEmail}</div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                        member.role === 'dev' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
                      }`}>
                        {member.role === 'dev' ? 'Developer' : 'Non-Developer'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.userId === teamDetails.team.leaderId && (
                        <Badge className="bg-purple-500 text-white">Leader</Badge>
                      )}
                      {/* Show remove button for team leaders, but not for the leader themselves */}
                      {hackathonUser?.userId === teamDetails.team.leaderId && member.userId !== teamDetails.team.leaderId && (
                        <Button
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team's Idea */}
          {teamDetails.idea && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">💡 Selected Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/20">
                  <h4 className="text-green-400 font-bold text-xl mb-2">{teamDetails.idea.title}</h4>
                  <p className="text-green-300 mb-3">{teamDetails.idea.description}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-pink-500 text-white">{teamDetails.idea.votes} votes</Badge>
                    <Badge className="bg-blue-500 text-white">
                      {teamDetails.idea.authorId === viewer._id ? "Your Idea" : "External Idea"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">⚙️ Team Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-cyan-200 text-sm">
                  Update the team's status to reflect their current stage in the hackathon process.
                </p>
                <div className="flex items-center gap-4">
                  <Select
                    value={teamDetails.team.status || "forming"}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-48 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-cyan-400/30">
                      <SelectItem value="forming" className="text-yellow-400">⏳ Forming</SelectItem>
                      <SelectItem value="idea-browsing" className="text-blue-400">🔍 Idea Browsing</SelectItem>
                      <SelectItem value="assembled" className="text-green-400">✅ Assembled</SelectItem>
                      <SelectItem value="ready" className="text-purple-400">🚀 Ready</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && (
                    <div className="text-cyan-300 text-sm">Updating...</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Forming:</strong> Team is still recruiting members</p>
                  <p><strong>Idea Browsing:</strong> Team is full and looking for an idea</p>
                  <p><strong>Assembled:</strong> Team has selected an idea and is ready to start</p>
                  <p><strong>Ready:</strong> Team is fully prepared for the hackathon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
