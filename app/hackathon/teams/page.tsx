"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { RocketIcon, AvatarIcon, StarIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import Link from "next/link";
import { FullScreenLoader, GridSkeleton } from "@/components/PixelatedLoader";

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  // Role-specific caps removed; total team size is fixed at 6
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "name">("votes");

  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const teams = useQuery(api.hackathon.getTeams) || [];
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  
  // Check if user has already created a team
  const userCreatedTeam = teams.find((team: any) => team.leaderId === hackathonUser?.userId);

  const createTeam = useMutation(api.hackathon.createTeam);
  const joinTeam = useMutation(api.hackathon.joinTeam);
  const assignIdeaToTeam = useMutation(api.hackathon.assignIdeaToTeam);
  const removeIdeaFromTeam = useMutation(api.hackathon.removeIdeaFromTeam);
  const adminDeleteTeam = useMutation(api.hackathon.adminDeleteTeam);

  if (!viewer) {
    return <FullScreenLoader text="Loading teams..." />;
  }

  // Admin check - only allow admin@hackathon.com
  const isAdmin = viewer.email === "admin@hackathon.com";

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    if (newTeamName.trim().length < 3) {
      toast.error("Team name must be at least 3 characters long");
      return;
    }

    // No role-specific slot restrictions; total team size is enforced server-side

    try {
      await createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
        maxDevs: 6,
        maxNonDevs: 6,
      });
      setNewTeamName("");
      setNewTeamDescription("");
      setShowCreateForm(false);
      toast.success("Team created successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already created a team")) {
        toast.error("You have already created a team");
      } else if (errorMessage.includes("already in a team")) {
        toast.error("You are already in a team");
      } else {
        toast.error("Failed to create team");
      }
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await joinTeam({ teamId: teamId as any });
      toast.success("Joined team successfully!");
    } catch {
      toast.error("Failed to join team");
    }
  };

  const handleAssignIdea = async (teamId: string, ideaId: string) => {
    try {
      await assignIdeaToTeam({ teamId: teamId as any, ideaId: ideaId as any });
      toast.success("Idea assigned to team successfully!");
    } catch {
      toast.error("Failed to assign idea to team");
    }
  };

  const handleRemoveIdea = async (teamId: string) => {
    try {
      await removeIdeaFromTeam({ teamId: teamId as any });
      toast.success("Idea removed from team successfully!");
    } catch {
      toast.error("Failed to remove idea from team");
    }
  };

  const handleAdminDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to admin delete this team? This will remove all members and cannot be undone.")) {
      return;
    }
    
    try {
      await adminDeleteTeam({ teamId: teamId as any });
      toast.success("Team admin deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  // Filter and sort teams
  const filteredAndSortedTeams = teams
    .filter((team: any) => {
      // Text search
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || team.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "votes":
          return b.votes - a.votes;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.votes - a.votes;
      }
    });

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="👥 TEAMS 👥" />

      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Create New Team */}
          {!hackathonUser?.teamId && !userCreatedTeam && !showCreateForm && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👥</div>
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 hackathon-title">
                  Create Your Team
                </h3>
                <p className="text-cyan-200 mb-4 sm:mb-6 text-sm sm:text-base hackathon-text">
                  Gather developers and non-developers to work together on amazing hackathon projects!
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                >
                  <RocketIcon className="mr-2 h-4 w-4" />
                  Create New Team
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!hackathonUser?.teamId && !userCreatedTeam && showCreateForm && (
            <Card id="create-team-form" className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                  <RocketIcon className="h-5 w-5" />
                  Create New Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-cyan-300 mb-2 block">Team Name *</label>
                  <Input
                    placeholder="Enter a creative team name..."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 3 characters</p>
                </div>
                
                <div>
                  <label className="text-sm text-cyan-300 mb-2 block">Team Description (Optional)</label>
                  <textarea
                    placeholder="Describe your team's vision, goals, and what you're looking for in members..."
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Help others understand your team&apos;s focus</p>
                </div>
                
                <div>
                  <label className="text-sm text-cyan-300 mb-2 block">Max Members</label>
                  <div className="flex items-center gap-2 p-2 bg-black/20 border border-cyan-400/30 rounded-md">
                    <Badge className="bg-cyan-500 text-white">Max Members: 6</Badge>
                    <span className="text-xs text-gray-400">Any mix of roles</span>
                  </div>
                </div>
                
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Tip:</strong> Balanced teams (1 dev + 1 non-dev) often work well, but you can adjust based on your project needs.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCreateTeam}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 flex-1"
                  >
                    <RocketIcon className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTeamName("");
                      setNewTeamDescription("");
                    }}
                    className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black py-3 flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter Controls */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <Input
                    placeholder="Search teams by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="forming">⏳ Forming</SelectItem>
                      <SelectItem value="idea-browsing">🔍 Idea Browsing</SelectItem>
                      <SelectItem value="assembled">✅ Assembled</SelectItem>
                      <SelectItem value="ready">🚀 Ready</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: "newest" | "votes" | "name") => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="votes">Most Votes</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="name">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="bg-cyan-500 text-white px-3 py-1 self-center">
                    {filteredAndSortedTeams.length} teams
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams List */}
          {filteredAndSortedTeams.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">👥</div>
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 hackathon-title">
                  {searchQuery || statusFilter !== "all" ? "No Teams Found" : "No Teams Yet"}
                </h3>
                <p className="text-cyan-200 mb-6 sm:mb-8 text-sm sm:text-base hackathon-text">
                  {searchQuery || statusFilter !== "all" 
                    ? "No teams match your current filters. Try adjusting your search criteria."
                    : "Be the first to create a team! Gather developers and non-developers to work together on amazing projects."
                  }
                </p>
                {(searchQuery || statusFilter !== "all") ? (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                  >
                    Clear Filters
                  </Button>
                ) : !userCreatedTeam ? (
                  <Button
                    onClick={() => {
                      // Scroll to the create form
                      const formElement = document.getElementById('create-team-form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                  >
                    <RocketIcon className="mr-2 h-4 w-4" />
                    Create First Team
                  </Button>
                ) : (
                  <p className="text-cyan-300 text-sm">
                    You've already created a team! Check it out below.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedTeams.map((team: any) => (
              <Card key={team._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-yellow-400 font-mono text-lg">{team.name}</CardTitle>
                    <Badge variant="secondary" className="bg-pink-500 text-white">
                      {team.votes} votes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-cyan-200 mb-4 text-sm leading-relaxed">{team.description}</p>
                  )}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-300">Developers:</span>
                      <span className="text-white">{team.currentDevs}/{team.maxDevs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-300">Non-Developers:</span>
                      <span className="text-white">{team.currentNonDevs}/{team.maxNonDevs}</span>
                    </div>
                    <div className="text-sm">
                      <div className="text-cyan-300 mb-1">Current Idea:</div>
                      <div className="text-white text-xs truncate" title={team.ideaId ? ideas.find((idea: any) => idea._id === team.ideaId)?.title || "Unknown Idea" : "N/A"}>
                        {team.ideaId 
                          ? ideas.find((idea: any) => idea._id === team.ideaId)?.title || "Unknown Idea"
                          : "N/A"
                        }
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cyan-300">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        team.status === 'forming' ? 'bg-yellow-500 text-black' :
                        team.status === 'idea-browsing' ? 'bg-blue-500 text-white' :
                        team.status === 'assembled' ? 'bg-green-500 text-white' :
                        team.status === 'ready' ? 'bg-purple-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {team.status === 'forming' ? '⏳ Forming' :
                         team.status === 'idea-browsing' ? '🔍 Idea Browsing' :
                         team.status === 'assembled' ? '✅ Assembled' :
                         team.status === 'ready' ? '🚀 Ready' :
                         '❓ Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Team Idea Assignment - Full section only for team leaders */}
                  {team.leaderId === hackathonUser?.userId && (
                    <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-400/20">
                      <h4 className="text-cyan-300 text-sm font-bold mb-2 flex items-center gap-2">
                        <StarIcon className="h-4 w-4" /> Team Idea Assignment
                      </h4>
                      {team.ideaId ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xs font-bold">Current Idea:</span>
                            <Badge className="bg-green-500 text-white text-xs max-w-full">
                              <span className="truncate">
                                {ideas.find((idea: any) => idea._id === team.ideaId)?.title}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRemoveIdea(team._id)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4"
                            >
                              Remove Idea
                            </Button>
                            <Button asChild size="sm" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-2 px-4">
                              <Link href="/hackathon/ideas">Browse Ideas</Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-400 text-xs mb-2">Select an idea for your team:</p>
                          <Select onValueChange={(ideaId) => handleAssignIdea(team._id, ideaId)}>
                            <SelectTrigger className="w-full bg-black/30 border-cyan-400/30 text-white">
                              <SelectValue placeholder="Choose an idea..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black/80 border-cyan-400/30 text-white max-h-60">
                              {ideas.length === 0 ? (
                                <SelectItem value="no-ideas" disabled>
                                  No ideas available
                                </SelectItem>
                              ) : (
                                ideas.map((idea: any) => (
                                  <SelectItem key={idea._id} value={idea._id}>
                                    <div className="flex items-center gap-2">
                                      <span>{idea.title}</span>
                                      <Badge className="bg-pink-500 text-white text-xs ml-2">
                                        {idea.votes} votes
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-col gap-2">
                            <Button asChild size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black py-2 px-4">
                              <Link href="/hackathon/ideas">Browse All Ideas</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black py-2 px-4">
                              <Link href="/hackathon/ideas">Submit New Idea</Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Team Member Management */}
                  {team.leaderId === hackathonUser?.userId && (
                    <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-400/20">
                      <h4 className="text-cyan-300 text-sm font-bold mb-2 flex items-center gap-2">
                        <AvatarIcon className="h-4 w-4" /> Team Management
                      </h4>
                      <div className="space-y-2">
                        <p className="text-gray-400 text-xs">
                          As team leader, you can manage your team members and settings.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button asChild size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black py-2 px-4">
                            <Link href={`/hackathon/teams/${team._id}`}>
                              Manage Members
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-2 px-4">
                            <Link href={`/hackathon/teams/${team._id}`}>
                              <Pencil1Icon className="mr-1 h-4 w-4" />
                              Edit Team
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Controls - Only visible to admin users for teams they don't own */}
                  {isAdmin && team.leaderId !== hackathonUser?.userId && (
                    <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                      <h4 className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
                        🚨 Admin Controls
                      </h4>
                      <div className="space-y-2">
                        <p className="text-red-300 text-xs">
                          Admin-only actions. Use with caution!
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleAdminDeleteTeam(team._id)}
                          className="bg-red-500 hover:bg-red-600 text-white w-full"
                        >
                          Admin Delete Team
                        </Button>
                      </div>
                    </div>
                  )}
                  
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Leader: {team.leaderId === hackathonUser?.userId ? "You" : "Anonymous"}
                              </span>
                              <Button asChild size="sm" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black py-2 px-4">
                                <Link href={`/hackathon/teams/${team._id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                            {!hackathonUser?.teamId && team.leaderId !== hackathonUser?.userId && (
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleJoinTeam(team._id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 w-full"
                                >
                                  <AvatarIcon className="mr-1 h-4 w-4" />
                                  Join
                                </Button>
                              </div>
                            )}
                          </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

