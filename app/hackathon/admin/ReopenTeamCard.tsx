"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { fromUkInput } from "@/lib/ukTime";

export function ReopenTeamCard({ teams }: { teams: Doc<"teams">[] }) {
  const adminReopenTeam = useMutation(api.submissions.adminReopenTeam);
  const [teamId, setTeamId] = useState<Id<"teams"> | "">("");
  const [until, setUntil] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleReopen = async () => {
    if (!teamId || !until) {
      toast.error("Pick a team and a reopen-until time");
      return;
    }
    setIsSaving(true);
    try {
      await adminReopenTeam({ teamId, until: fromUkInput(until) });
      toast.success("Editing reopened for the team");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reopen editing"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 font-mono">🔓 Reopen editing for team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-yellow-300 font-semibold">Team</span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value as Id<"teams"> | "")}
              className="h-9 w-full rounded-md border border-cyan-400/30 bg-black/20 px-3 text-white"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-yellow-300 font-semibold">Editable until</span>
            <Input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="bg-black/20 border-cyan-400/30 text-white"
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            UK time (Europe/London). Works even if the team never saved. Pick a past time to close it again.
          </div>
          <Button
            size="sm"
            onClick={handleReopen}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSaving ? "Saving..." : "Reopen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
