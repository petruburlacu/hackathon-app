"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HackathonNav } from "@/components/HackathonNav";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");

  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const updateHackathonUser = useMutation(api.hackathon.updateHackathonUser);

  // Initialize edit fields when hackathonUser loads
  React.useEffect(() => {
    if (hackathonUser) {
      setEditDisplayName(hackathonUser.displayName || "");
    }
  }, [hackathonUser]);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    try {
      await updateHackathonUser({
        displayName: editDisplayName.trim(),
      });
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="⚙️ PROFILE MANAGEMENT ⚙️" />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono text-2xl">👤 Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                  {hackathonUser?.displayName?.charAt(0)?.toUpperCase() || viewer.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {hackathonUser?.displayName || "Not set"}
                  </h2>
                  <p className="text-cyan-300">{viewer.email}</p>
                  <Badge className={`mt-2 ${hackathonUser?.role === 'dev' ? 'bg-blue-500' : 'bg-pink-500'} text-white`}>
                    {hackathonUser?.role === 'dev' ? '💻 Developer' : '🎨 Non-Developer'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400 font-mono">⚙️ Edit Profile</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                >
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfile ? (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="editDisplayName" className="text-sm font-medium text-cyan-300 mb-2 block">
                      Display Name *
                    </label>
                    <Input
                      id="editDisplayName"
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This is how your name will appear throughout the hackathon platform
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <h4 className="text-cyan-300 font-medium mb-2">Display Name</h4>
                      <p className="text-white text-lg">{hackathonUser?.displayName || "Not set"}</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <h4 className="text-cyan-300 font-medium mb-2">Role</h4>
                      <Badge className={`${hackathonUser?.role === 'dev' ? 'bg-blue-500' : 'bg-pink-500'} text-white`}>
                        {hackathonUser?.role === 'dev' ? '💻 Developer' : '🎨 Non-Developer'}
                      </Badge>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <h4 className="text-cyan-300 font-medium mb-2">Email</h4>
                      <p className="text-white">{viewer.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🔐 Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-medium">Account Type:</span>
                  <Badge className="bg-green-500 text-white">Hackathon Participant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-medium">Registration Date:</span>
                  <span className="text-white">
                    {hackathonUser ? new Date().toLocaleDateString() : "Not registered"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-medium">Status:</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Link href="/hackathon/my-dashboard">View Dashboard</Link>
                </Button>
                <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Link href="/hackathon/ideas">Browse Ideas</Link>
                </Button>
                <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                  <Link href="/hackathon/teams">View Teams</Link>
                </Button>
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/hackathon/leaderboard">Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
