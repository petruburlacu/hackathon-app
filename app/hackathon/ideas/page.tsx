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
import { PlusIcon, StarIcon } from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";

export default function IdeasPage() {
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "title">("votes");

  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);

  const createIdea = useMutation(api.hackathon.createIdea);
  const toggleIdeaVote = useMutation(api.hackathon.toggleIdeaVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);
  const assignIdeaToTeam = useMutation(api.hackathon.assignIdeaToTeam);
  const removeIdeaFromTeam = useMutation(api.hackathon.removeIdeaFromTeam);
  const deleteIdea = useMutation(api.hackathon.deleteIdea);
  const adminDeleteIdea = useMutation(api.hackathon.adminDeleteIdea);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl hackathon-text">Loading...</div>
      </div>
    );
  }

  // Simple admin check - in a real app, you'd have proper role-based access
  const isAdmin = viewer.email === "admin@hackathon.com";

  const handleCreateIdea = async () => {
    if (!newIdeaTitle.trim() || !newIdeaDescription.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }

    if (newIdeaTitle.trim().length < 5) {
      toast.error("Idea title must be at least 5 characters long");
      return;
    }

    if (newIdeaDescription.trim().length < 20) {
      toast.error("Idea description must be at least 20 characters long");
      return;
    }

    try {
      await createIdea({
        title: newIdeaTitle.trim(),
        description: newIdeaDescription.trim(),
      });
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      toast.success("Idea submitted successfully!");
    } catch {
      toast.error("Failed to submit idea");
    }
  };

  // Filter and sort ideas
  const filteredAndSortedIdeas = ideas
    .filter((idea: any) => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "votes":
          return b.votes - a.votes;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.votes - a.votes;
      }
    });

  const handleToggleIdeaVote = async (ideaId: string) => {
    try {
      const result = await toggleIdeaVote({ ideaId });
      if (result.action === "added") {
        toast.success("Vote recorded!");
      } else {
        toast.success("Vote retracted!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle vote");
    }
  };

  const hasVotedForIdea = (ideaId: string) => {
    if (!voteStatus) return false; // Still loading
    const ideaIdStr = String(ideaId);
    return voteStatus.ideaVotes?.some((votedIdeaId: string) => String(votedIdeaId) === ideaIdStr) || false;
  };

  const handleAssignIdea = async (ideaId: string) => {
    if (!myTeamDetails?.team) {
      toast.error("You must be in a team to assign ideas");
      return;
    }
    
    try {
      await assignIdeaToTeam({ teamId: myTeamDetails.team._id, ideaId });
      toast.success("Idea assigned to your team!");
    } catch {
      toast.error("Failed to assign idea to team");
    }
  };

  const handleRemoveIdea = async () => {
    if (!myTeamDetails?.team) {
      toast.error("You must be in a team to remove ideas");
      return;
    }
    
    try {
      await removeIdeaFromTeam({ teamId: myTeamDetails.team._id });
      toast.success("Idea removed from your team!");
    } catch {
      toast.error("Failed to remove idea from team");
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteIdea({ ideaId: ideaId as any });
      toast.success("Idea deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleAdminDeleteIdea = async (ideaId: string) => {
    if (!confirm("Are you sure you want to admin delete this idea? This will remove it from all teams and cannot be undone.")) {
      return;
    }
    
    try {
      await adminDeleteIdea({ ideaId: ideaId as any });
      toast.success("Idea admin deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="💡 IDEAS BOARD 💡" />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Submit New Idea */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Submit New Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Idea title..."
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
              />
              <textarea
                placeholder="Describe your idea in detail..."
                value={newIdeaDescription}
                onChange={(e) => setNewIdeaDescription(e.target.value)}
                rows={6}
                className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
              <Button
                onClick={handleCreateIdea}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              >
                Submit Idea
              </Button>
            </CardContent>
          </Card>

          {/* Search and Sort Controls */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search ideas by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: "newest" | "votes" | "title") => setSortBy(value)}>
                    <SelectTrigger className="w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="votes">Most Votes</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="bg-cyan-500 text-white px-3 py-1">
                    {filteredAndSortedIdeas.length} ideas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ideas List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedIdeas.map((idea: any) => (
              <Card key={idea._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-yellow-400 font-mono text-lg">{idea.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-pink-500 text-white">
                        {idea.votes} votes
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        {teams.filter((team: any) => team.ideaId === idea._id).length} teams
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-cyan-200 mb-4 text-sm leading-relaxed">
                    {idea.description.length > 150 
                      ? `${idea.description.substring(0, 150)}...` 
                      : idea.description
                    }
                  </p>
                  
                  {/* Team Assignment Controls */}
                  {myTeamDetails?.isLeader && (
                    <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-400/10">
                      <h5 className="text-cyan-300 font-bold text-xs mb-2">Team Assignment:</h5>
                      {myTeamDetails.team.ideaId === idea._id ? (
                        <div className="space-y-2">
                          <p className="text-green-400 text-xs">✅ This idea is assigned to your team</p>
                          <Button
                            size="sm"
                            onClick={handleRemoveIdea}
                            className="bg-red-500 hover:bg-red-600 text-white w-full"
                          >
                            Remove from Team
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAssignIdea(idea._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                        >
                          Assign to My Team
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Admin Controls - Only visible to admin users for ideas they don't own */}
                  {isAdmin && idea.authorId !== hackathonUser?.userId && (
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
                          onClick={() => handleAdminDeleteIdea(idea._id)}
                          className="bg-red-500 hover:bg-red-600 text-white w-full"
                        >
                          Admin Delete Idea
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      by {idea.authorId === hackathonUser?.userId ? "You" : "Anonymous"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleToggleIdeaVote(idea._id)}
                        className={`transition-all duration-300 transform hover:scale-105 ${
                          hasVotedForIdea(idea._id)
                            ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 shadow-lg shadow-green-500/25"
                            : "bg-pink-500 hover:bg-pink-600 text-white border-2 border-pink-300 shadow-lg shadow-pink-500/25"
                        }`}
                      >
                        <StarIcon className="mr-1 h-4 w-4" />
                        {hasVotedForIdea(idea._id) ? "Voted" : "Vote"}
                      </Button>
                      {idea.authorId === hackathonUser?.userId && (
                        <Button
                          size="sm"
                          onClick={() => handleDeleteIdea(idea._id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                        onClick={() => {
                          // TODO: Implement idea details modal or page
                          alert(`Idea Details:\n\nTitle: ${idea.title}\n\nDescription: ${idea.description}\n\nVotes: ${idea.votes}\n\nTeams using this idea: ${teams.filter((team: any) => team.ideaId === idea._id).length}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedIdeas.length === 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  {searchQuery ? "No Ideas Found" : "No Ideas Yet"}
                </h3>
                <p className="text-cyan-200 mb-6">
                  {searchQuery 
                    ? `No ideas match your search for "${searchQuery}". Try a different search term.`
                    : "Be the first to submit an innovative idea for the hackathon!"
                  }
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
