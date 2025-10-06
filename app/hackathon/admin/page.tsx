"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HackathonNav } from "@/components/HackathonNav";

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const viewer = useQuery(api.users.viewer);
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];

  const seedData = useMutation(api.seed.seedHackathonData);
  const clearData = useMutation(api.seed.clearHackathonData);
  const migrateTeamStatuses = useMutation(api.hackathon.migrateTeamStatuses);
  const adminDeleteIdea = useMutation(api.hackathon.adminDeleteIdea);
  const adminDeleteTeam = useMutation(api.hackathon.adminDeleteTeam);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Admin check - only allow admin@hackathon.com
  const isAdmin = viewer.email === "admin@hackathon.com";
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-red-400 text-2xl font-bold mb-4">🚫 Access Denied</div>
          <div className="text-cyan-200 text-lg">You don&apos;t have admin privileges</div>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedData({});
      toast.success(`Seeded ${result.ideasCreated} sample ideas!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already exists")) {
        toast.error("Data already exists! Clear first to reseed.");
      } else {
        toast.error("Failed to seed data");
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const result = await clearData({});
      toast.success(`Cleared ${result.deleted.ideas} ideas and ${result.deleted.teams} teams!`);
    } catch {
      toast.error("Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAndSeed = async () => {
    setIsClearing(true);
    try {
      await clearData({});
      toast.success("Data cleared!");
      
      setIsClearing(false);
      setIsSeeding(true);
      
      const result = await seedData({});
      toast.success(`Seeded ${result.ideasCreated} sample ideas!`);
    } catch {
      toast.error("Failed to clear and seed data");
    } finally {
      setIsSeeding(false);
      setIsClearing(false);
    }
  };

  const handleMigrateStatuses = async () => {
    try {
      const result = await migrateTeamStatuses({});
      toast.success(`Migrated ${result.migrated} team statuses!`);
    } catch {
      toast.error("Failed to migrate team statuses");
    }
  };

  const handleAdminDeleteIdea = async (ideaId: string) => {
    if (!confirm("Are you sure you want to admin delete this idea? This will remove it from all teams and cannot be undone.")) {
      return;
    }
    
    try {
      await adminDeleteIdea({ ideaId });
      toast.success("Idea admin deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleAdminDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to admin delete this team? This will remove all members and cannot be undone.")) {
      return;
    }
    
    try {
      await adminDeleteTeam({ teamId });
      toast.success("Team admin deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="🛠️ ADMIN PANEL 🛠️" />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Stats */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">📊 Current Hackathon Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">{ideas.length}</div>
                  <div className="text-gray-400">Ideas Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">{teams.length}</div>
                  <div className="text-gray-400">Teams Created</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🌱 Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={handleSeed}
                  disabled={isSeeding || isClearing}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  {isSeeding ? "Seeding..." : "🌱 Seed Sample Ideas"}
                </Button>
                
                <Button
                  onClick={handleClear}
                  disabled={isSeeding || isClearing}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  {isClearing ? "Clearing..." : "🗑️ Clear All Data"}
                </Button>
                
                <Button
                  onClick={handleClearAndSeed}
                  disabled={isSeeding || isClearing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  {isSeeding || isClearing ? "Working..." : "🔄 Clear & Reseed"}
                </Button>
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={handleMigrateStatuses}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                >
                  🔄 Migrate Team Statuses
                </Button>
              </div>
              
              <div className="text-sm text-gray-400 space-y-2">
                <p><strong>🌱 Seed Sample Ideas:</strong> Adds 6 pre-made hackathon ideas to get started</p>
                <p><strong>🗑️ Clear All Data:</strong> Removes all ideas, teams, votes, and user profiles</p>
                <p><strong>🔄 Clear & Reseed:</strong> Clears everything and adds fresh sample data</p>
                <p><strong>🔄 Migrate Team Statuses:</strong> Updates existing teams to use the new status system</p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Ideas Preview */}
          {ideas.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">💡 Current Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {ideas.slice(0, 6).map((idea: any) => (
                    <div key={idea._id} className="bg-black/20 p-3 rounded-lg border border-cyan-400/10">
                      <h4 className="text-yellow-400 font-bold text-sm mb-1">{idea.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{idea.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded">
                          {idea.votes} votes
                        </span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          {teams.filter((team: any) => team.ideaId === idea._id).length} teams
                        </span>
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAdminDeleteIdea(idea._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          Delete Idea
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teams Preview */}
          {teams.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">👥 Current Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {teams.slice(0, 6).map((team: any) => (
                    <div key={team._id} className="bg-black/20 p-3 rounded-lg border border-cyan-400/10">
                      <h4 className="text-yellow-400 font-bold text-sm mb-1">{team.name}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{team.description || "No description"}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                          {team.votes} votes
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          team.status === 'forming' ? 'bg-yellow-500 text-black' :
                          team.status === 'idea-browsing' ? 'bg-blue-500 text-white' :
                          team.status === 'assembled' ? 'bg-green-500 text-white' :
                          team.status === 'ready' ? 'bg-purple-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {team.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAdminDeleteTeam(team._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          Delete Team
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
