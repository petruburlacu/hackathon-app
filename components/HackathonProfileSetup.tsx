"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CodeIcon, PersonIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface HackathonProfileSetupProps {
  children: React.ReactNode;
}

export function HackathonProfileSetup({ children }: HackathonProfileSetupProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [role, setRole] = useState<"dev" | "non-dev" | "admin" | null>(null);
  const [displayName, setDisplayName] = useState("");
  
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const createHackathonUser = useMutation(api.hackathon.createHackathonUser);
  const viewer = useQuery(api.users.viewer);

  useEffect(() => {
    // If user is authenticated but doesn't have a hackathon profile, show setup
    if (hackathonUser === null) {
      setShowSetup(true);
    }
  }, [hackathonUser]);

  // Check if user is admin
  const isAdmin = viewer?.email === "admin@hackathon.com";

  const handleSetup = async () => {
    if (!role) {
      toast.error("Please select your role");
      return;
    }

    if (!displayName.trim()) {
      toast.error("Please enter your display name");
      return;
    }

    try {
      await createHackathonUser({
        role,
        displayName: displayName.trim(),
      });
      setShowSetup(false);
      toast.success("Hackathon profile created successfully!");
    } catch (error) {
      console.error("Failed to create hackathon profile:", error);
      toast.error("Failed to create hackathon profile. Please try again.");
    }
  };

  // If user doesn't have a hackathon profile, show setup form
  if (showSetup) {
    return (
      <div className="flex min-h-screen w-full container my-auto mx-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-[500px] mx-auto flex flex-col my-auto gap-6 pb-8">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-yellow-400 text-black font-bold text-lg rounded-lg mb-6 transform -rotate-2 shadow-lg">
              🚀 COMPLETE YOUR PROFILE 🚀
            </div>
            <h2 className="font-semibold text-3xl tracking-tight text-yellow-400 font-mono mb-4">
              Join the Hackathon
            </h2>
            <p className="text-cyan-200 text-lg">
              Complete your profile to participate in the hackathon
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-cyan-400/20">
            <div className="space-y-6">
              <div>
                <label htmlFor="displayName" className="text-sm font-medium text-cyan-300 mb-2 block">
                  Display Name *
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name as it will appear"
                  className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
                  required
                />
              </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block text-cyan-300">
                          Choose your role *
                        </label>
                        <ToggleGroup
                          type="single"
                          value={role || ""}
                          onValueChange={(value) => setRole(value as "dev" | "non-dev" | "admin" | null)}
                          className="w-full"
                        >
                          <ToggleGroupItem value="dev" className="flex-1 bg-blue-500/20 border-blue-400/30 text-blue-300 data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                            <CodeIcon className="mr-2 h-4 w-4" />
                            Developer
                          </ToggleGroupItem>
                          <ToggleGroupItem value="non-dev" className="flex-1 bg-pink-500/20 border-pink-400/30 text-pink-300 data-[state=on]:bg-pink-500 data-[state=on]:text-white">
                            <PersonIcon className="mr-2 h-4 w-4" />
                            Non-Developer
                          </ToggleGroupItem>
                          {isAdmin && (
                            <ToggleGroupItem value="admin" className="flex-1 bg-red-500/20 border-red-400/30 text-red-300 data-[state=on]:bg-red-500 data-[state=on]:text-white">
                              <PersonIcon className="mr-2 h-4 w-4" />
                              Admin
                            </ToggleGroupItem>
                          )}
                        </ToggleGroup>
                      </div>

              <Button 
                onClick={handleSetup}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-3"
                disabled={!role || !displayName.trim()}
              >
                Complete Profile & Enter Hackathon
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has a hackathon profile, show the normal content
  return <>{children}</>;
}
