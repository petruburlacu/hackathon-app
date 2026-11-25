"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { HackathonNav } from "@/components/HackathonNav";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { roleBadgeClass, roleLabel } from "@/lib/roleLabel";
import { plural } from "@/lib/plural";

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const updateHackathonUser = useMutation(api.hackathon.updateHackathonUser);
  const getActiveSessions = useQuery(api.hackathon.getActiveSessions);
  const logoutAllSessions = useMutation(api.hackathon.logoutAllSessions);

  // Initialize edit fields when hackathonUser loads
  React.useEffect(() => {
    if (hackathonUser) {
      setEditDisplayName(hackathonUser.displayName || "");
    }
  }, [hackathonUser]);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
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
      toast.error(getErrorMessage(error, "Failed to update profile"));
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAllSessions();
      toast.success("All sessions logged out successfully! You will be redirected to sign in.");
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log out all sessions"));
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="⚙️ PROFILE MANAGEMENT ⚙️" />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono text-2xl">👤 Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                  {hackathonUser?.displayName?.charAt(0)?.toUpperCase() || viewer.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {hackathonUser?.displayName || "Not set"}
                  </h2>
                  <p className="text-cyan-300">{viewer.username}</p>
                  {hackathonUser && (
                    <Badge className={`mt-2 ${roleBadgeClass(hackathonUser.role)} text-white`}>
                      {roleLabel(hackathonUser.role)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
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
                      {hackathonUser && (
                        <Badge className={`${roleBadgeClass(hackathonUser.role)} text-white`}>
                          {roleLabel(hackathonUser.role)}
                        </Badge>
                      )}
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                      <h4 className="text-cyan-300 font-medium mb-2">Username</h4>
                      <p className="text-white">{viewer.username}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          {hackathonUser && (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">🔐 Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-medium">Joined:</span>
                  <span className="text-white">
                    {new Date(hackathonUser._creationTime).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Management */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🔒 Session Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                  <h4 className="text-cyan-300 font-medium mb-2">Active Sessions</h4>
                  <p className="text-white text-sm mb-3">
                    You can be signed in on several devices at once. If you see a session you
                    don&apos;t recognise, use &quot;Logout All Sessions&quot; below.
                  </p>
                  {getActiveSessions && getActiveSessions.length > 0 ? (
                    <p className="text-green-400 text-sm">
                      ✅ {plural(getActiveSessions.length, "active session")}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">No active sessions found</p>
                  )}
                </div>
                
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-400/20">
                  <h4 className="text-red-400 font-medium mb-2">⚠️ Security Actions</h4>
                  <p className="text-white text-sm mb-3">
                    Log out from all devices and sessions. This will terminate your current session and any other active sessions.
                  </p>
                  <Button
                    onClick={() => setConfirmLogoutAll(true)}
                    disabled={isLoggingOutAll}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isLoggingOutAll ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging out…
                      </div>
                    ) : (
                      "🚪 Logout All Sessions"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      <ConfirmDialog
        open={confirmLogoutAll}
        onOpenChange={setConfirmLogoutAll}
        title="Log out everywhere?"
        confirmLabel="Log out all sessions"
        tone="destructive"
        onConfirm={handleLogoutAllSessions}
      >
        <p>This signs you out on every device, including this one. You&apos;ll need to sign in again.</p>
      </ConfirmDialog>
    </main>
  );
}
