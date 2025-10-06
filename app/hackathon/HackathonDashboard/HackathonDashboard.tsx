"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  PlusIcon,
  StarIcon,
  AvatarIcon,
  BadgeIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

interface HackathonUser {
  _id: string;
  userId: string;
  role: "dev" | "non-dev";
  companyEmail?: string;
  teamId?: string;
}

export function HackathonDashboard({ hackathonUser }: { hackathonUser: HackathonUser | null | undefined }) {
  const [activeTab, setActiveTab] = useState<"ideas" | "teams" | "leaderboard">("ideas");
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [maxDevs, setMaxDevs] = useState(2);
  const [maxNonDevs, setMaxNonDevs] = useState(2);

  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const leaderboard = useQuery(api.hackathon.getLeaderboard) || [];

  const createIdea = useMutation(api.hackathon.createIdea);
  const createTeam = useMutation(api.hackathon.createTeam);
  const joinTeam = useMutation(api.hackathon.joinTeam);
  const toggleIdeaVote = useMutation(api.hackathon.toggleIdeaVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);

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
              <a href="/signin">Sign In / Register</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateIdea = async () => {
    if (!newIdeaTitle.trim() || !newIdeaDescription.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }

    try {
      await createIdea({
        title: newIdeaTitle,
        description: newIdeaDescription,
        category: "Other", // Default category
        tags: [], // Default empty tags
      });
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      toast.success("Idea submitted successfully!");
    } catch {
      toast.error("Failed to submit idea");
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    try {
      await createTeam({
        name: newTeamName,
        description: newTeamDescription,
        maxDevs,
        maxNonDevs,
      });
      setNewTeamName("");
      setNewTeamDescription("");
      toast.success("Team created successfully!");
    } catch {
      toast.error("Failed to create team");
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await joinTeam({ teamId: teamId as Id<"teams"> });
      toast.success("Joined team successfully!");
    } catch {
      toast.error("Failed to join team");
    }
  };

  const handleToggleIdeaVote = async (ideaId: string) => {
    try {
      const result = await toggleIdeaVote({ ideaId: ideaId as Id<"ideas"> });
      if (result.action === "added") {
        toast.success("Vote recorded!");
      } else {
        toast.success("Vote retracted!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to toggle vote";
      toast.error(errorMessage);
    }
  };

  const hasVotedForIdea = (ideaId: string) => {
    if (!voteStatus) return false; // Still loading
    const ideaIdStr = String(ideaId);
    return voteStatus.ideaVotes?.some((votedIdeaId: string) => String(votedIdeaId) === ideaIdStr) || false;
  };

  return (
    <div className="flex-1 p-6">
      {/* Tab Navigation */}
      <div className="mb-8">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="bg-black/20 backdrop-blur-sm p-1 rounded-lg border border-cyan-400/20"
        >
          <ToggleGroupItem value="ideas" className="data-[state=on]:bg-yellow-400 data-[state=on]:text-black">
            <StarIcon className="mr-2 h-4 w-4" />
            Ideas
          </ToggleGroupItem>
          <ToggleGroupItem value="teams" className="data-[state=on]:bg-yellow-400 data-[state=on]:text-black">
            <AvatarIcon className="mr-2 h-4 w-4" />
            Teams
          </ToggleGroupItem>
          <ToggleGroupItem value="leaderboard" className="data-[state=on]:bg-yellow-400 data-[state=on]:text-black">
            <BadgeIcon className="mr-2 h-4 w-4" />
            Leaderboard
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Ideas Tab */}
      {activeTab === "ideas" && (
        <div className="space-y-6">
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
              <Input
                placeholder="Describe your idea..."
                value={newIdeaDescription}
                onChange={(e) => setNewIdeaDescription(e.target.value)}
                className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleCreateIdea}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              >
                Submit Idea
              </Button>
            </CardContent>
          </Card>

          {/* Ideas List */}
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((idea) => (
              <Card key={idea._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-yellow-400 font-mono text-lg">{idea.title}</CardTitle>
                    <Badge variant="secondary" className="bg-pink-500 text-white">
                      {idea.votes} votes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-cyan-200 mb-4">{idea.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      by {idea.authorId === hackathonUser.userId ? "You" : "Anonymous"}
                    </span>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {/* Create New Team */}
          {!hackathonUser.teamId && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                  <RocketIcon className="h-5 w-5" />
                  Create New Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Team name..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Team description (optional)..."
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-cyan-300 mb-2 block">Max Developers</label>
                    <Input
                      type="number"
                      min="1"
                      max="2"
                      value={maxDevs}
                      onChange={(e) => setMaxDevs(parseInt(e.target.value))}
                      className="bg-black/20 border-cyan-400/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyan-300 mb-2 block">Max Non-Developers</label>
                    <Input
                      type="number"
                      min="1"
                      max="2"
                      value={maxNonDevs}
                      onChange={(e) => setMaxNonDevs(parseInt(e.target.value))}
                      className="bg-black/20 border-cyan-400/30 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateTeam}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                >
                  Create Team
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Teams List */}
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all">
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
                    <p className="text-cyan-200 mb-4">{team.description}</p>
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
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Leader: {team.leaderId === hackathonUser.userId ? "You" : "Anonymous"}
                    </span>
                    {!hackathonUser.teamId && team.leaderId !== hackathonUser.userId && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinTeam(team._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <AvatarIcon className="mr-1 h-4 w-4" />
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono text-center text-2xl">
                🏆 TEAM LEADERBOARD 🏆
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {leaderboard.map((team, index: number) => (
              <Card key={team._id} className={`bg-black/40 backdrop-blur-sm border-cyan-400/20 ${
                index === 0 ? 'border-yellow-400/60 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-orange-400' : 'text-cyan-300'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400 font-mono">{team.name}</h3>
                        <p className="text-cyan-200 text-sm">
                          {team.currentDevs} devs, {team.currentNonDevs} non-devs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-400">{team.votes}</div>
                      <div className="text-sm text-gray-400">votes</div>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mt-4 text-center">
                      <Badge className={`${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        'bg-orange-400 text-black'
                      }`}>
                        {index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
