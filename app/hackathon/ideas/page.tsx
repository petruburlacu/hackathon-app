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
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";

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
  const voteForIdea = useMutation(api.hackathon.voteForIdea);
  const assignIdeaToTeam = useMutation(api.hackathon.assignIdeaToTeam);
  const removeIdeaFromTeam = useMutation(api.hackathon.removeIdeaFromTeam);
  const deleteIdea = useMutation(api.hackathon.deleteIdea);
  const adminDeleteIdea = useMutation(api.hackathon.adminDeleteIdea);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
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
    } catch (error) {
      toast.error("Failed to submit idea");
    }
  };

  // Filter and sort ideas
  const filteredAndSortedIdeas = ideas
    .filter(idea => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
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

  const handleVoteIdea = async (ideaId: string) => {
    try {
      await voteForIdea({ ideaId });
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to vote for idea");
    }
  };

  const handleAssignIdea = async (ideaId: string) => {
    if (!myTeamDetails?.team) {
      toast.error("You must be in a team to assign ideas");
      return;
    }
    
    try {
      await assignIdeaToTeam({ teamId: myTeamDetails.team._id, ideaId });
      toast.success("Idea assigned to your team!");
    } catch (error) {
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
    } catch (error) {
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
      <div className="flex items-start justify-between border-b border-cyan-400/20 p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-yellow-400 font-mono">
            💡 IDEAS BOARD 💡
          </div>
          {hackathonUser && (
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 text-sm">Role:</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                hackathonUser.role === 'dev' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-pink-500 text-white'
              }`}>
                {hackathonUser.role === 'dev' ? '💻 Developer' : '🎨 Non-Developer'}
              </span>
            </div>
          )}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/hackathon" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Dashboard
            </Link>
            <Link href="/hackathon/my-dashboard" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              My Dashboard
            </Link>
            <Link href="/hackathon/ideas" className="text-yellow-400 font-mono text-sm font-bold">
              Ideas
            </Link>
            <Link href="/hackathon/teams" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Teams
            </Link>
            <Link href="/hackathon/leaderboard" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Leaderboard
            </Link>
            {isAdmin && (
              <Link href="/hackathon/admin" className="text-red-300 hover:text-red-400 transition-colors font-mono text-sm">
                Admin
              </Link>
            )}
            <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
              Home
            </Link>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <select 
              className="bg-black/30 border border-cyan-400/30 text-white rounded px-2 py-1 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  window.location.href = e.target.value;
                }
              }}
            >
              <option value="">Navigate...</option>
              <option value="/hackathon">Dashboard</option>
              <option value="/hackathon/my-dashboard">My Dashboard</option>
              <option value="/hackathon/ideas">Ideas</option>
              <option value="/hackathon/teams">Teams</option>
              <option value="/hackathon/leaderboard">Leaderboard</option>
              {isAdmin && <option value="/hackathon/admin">Admin</option>}
              <option value="/">Home</option>
            </select>
          </div>
        </div>
        <UserMenu>{viewer.name}</UserMenu>
      </div>

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
            {filteredAndSortedIdeas.map((idea) => (
              <Card key={idea._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-yellow-400 font-mono text-lg">{idea.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-pink-500 text-white">
                        {idea.votes} votes
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        {teams.filter(team => team.ideaId === idea._id).length} teams
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-cyan-200 mb-4 text-sm leading-relaxed">{idea.description}</p>
                  
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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      by {idea.authorId === hackathonUser?.userId ? "You" : "Anonymous"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVoteIdea(idea._id)}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <StarIcon className="mr-1 h-4 w-4" />
                        Vote
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
                        onClick={() => handleAdminDeleteIdea(idea._id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Admin Delete
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
