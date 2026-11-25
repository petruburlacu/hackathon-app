"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { plural } from "@/lib/plural";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { HackathonNav } from "@/components/HackathonNav";
import { Id } from "@/convex/_generated/dataModel";
import { EventClockCard, TestModeNotice } from "./EventClockCard";
import { ReopenTeamCard } from "./ReopenTeamCard";
import { ExportResultsCard } from "./ExportResultsCard";

// Type for idea object
type Idea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  authorId: Id<"users">;
  createdAt: number;
  votes: number;
  isSelected: boolean;
  category?: string;
  tags?: string[];
};

// Type for team object
type Team = {
  _id: Id<"teams">;
  name: string;
  description?: string;
  leaderId: Id<"users">;
  ideaId?: Id<"ideas">;
  status?: "forming" | "idea-browsing" | "assembled" | "ready";
  isAssembled?: boolean;
  maxDevs: number;
  maxNonDevs: number;
  currentDevs: number;
  currentNonDevs: number;
  createdAt: number;
};

const TEAM_STATUS_LABELS: Record<NonNullable<Team["status"]>, string> = {
  forming: "Forming",
  "idea-browsing": "Choosing an idea",
  assembled: "Assembled",
  ready: "Ready",
};

const PREVIEW_COUNT = 6;

type PendingAction =
  | { kind: "clear" }
  | { kind: "clearAndSeed" }
  | { kind: "deleteIdea"; id: Id<"ideas">; title: string }
  | { kind: "deleteTeam"; id: Id<"teams">; name: string };

function SettingSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-black/20 border border-cyan-400/10 rounded p-3">
      <div>
        <div className="text-yellow-300 font-semibold">{label}</div>
        <div className="text-gray-400 text-sm">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
          checked ? "bg-green-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);

  const viewer = useQuery(api.users.viewer);
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const settings = useQuery(api.hackathon.getSettings);

  const seedData = useMutation(api.seed.seedHackathonData);
  const clearData = useMutation(api.seed.clearHackathonData);
  const adminDeleteIdea = useMutation(api.hackathon.adminDeleteIdea);
  const adminDeleteTeam = useMutation(api.hackathon.adminDeleteTeam);
  const updateSettings = useMutation(api.hackathon.updateSettings);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  const isAdmin = viewer.isAdmin;
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
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
      toast.success(`Seeded ${plural(result.ideasCreated, "sample idea")}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to seed data"));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const result = await clearData({});
      toast.success(`Cleared ${plural(result.deleted.ideas, "idea")} and ${plural(result.deleted.teams, "team")}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to clear data"));
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
      toast.success(`Seeded ${plural(result.ideasCreated, "sample idea")}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to clear and seed data"));
    } finally {
      setIsSeeding(false);
      setIsClearing(false);
    }
  };

  const handleToggleSubmissions = async (type: "ideas" | "teams", value: boolean) => {
    try {
      await updateSettings({
        enableIdeaSubmissions: type === "ideas" ? value : (settings?.enableIdeaSubmissions ?? true),
        enableTeamSubmissions: type === "teams" ? value : (settings?.enableTeamSubmissions ?? true),
      });
      toast.success(`${type === "ideas" ? "Ideas" : "Teams"} submissions ${value ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update settings"));
    }
  };

  const handleAdminDeleteIdea = async (ideaId: Id<"ideas">) => {
    try {
      await adminDeleteIdea({ ideaId });
      toast.success("Idea deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete idea"));
    }
  };

  const handleAdminDeleteTeam = async (teamId: Id<"teams">) => {
    try {
      await adminDeleteTeam({ teamId });
      toast.success("Team deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete team"));
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="🛠️ ADMIN PANEL 🛠️" />
      <TestModeNotice />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Current Stats */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
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

          <EventClockCard />

          <ReopenTeamCard teams={teams} />

          <ExportResultsCard />

          {/* Submission Controls */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🚦 Submission Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings === undefined ? (
                <p className="text-sm text-gray-400" role="status">Loading settings…</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <SettingSwitch
                    label="Idea submissions"
                    description="Allow users to submit new ideas"
                    checked={settings?.enableIdeaSubmissions ?? true}
                    onChange={(value) => handleToggleSubmissions("ideas", value)}
                  />
                  <SettingSwitch
                    label="Team creation"
                    description="Allow users to create new teams"
                    checked={settings?.enableTeamSubmissions ?? true}
                    onChange={(value) => handleToggleSubmissions("teams", value)}
                  />
                </div>
              )}
              <div className="text-xs text-gray-500">
                Changes take effect immediately across the app. Server-side checks enforce these rules.
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 font-mono">🌱 Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  onClick={handleSeed}
                  disabled={isSeeding || isClearing}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  {isSeeding ? "Seeding…" : "🌱 Seed Sample Ideas"}
                </Button>
                <p className="text-sm text-gray-400">Adds 6 pre-made hackathon ideas. Existing data is kept.</p>
              </div>

              <section
                aria-labelledby="danger-zone-heading"
                className="mt-6 rounded-lg border border-red-500/60 bg-red-950/30 p-4 space-y-3"
              >
                <h3 id="danger-zone-heading" className="text-red-300 font-bold">⚠️ Danger zone</h3>
                <p className="text-sm text-red-200">
                  These delete every idea, team, upvote, user profile and team submission. They can&apos;t be undone.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => setPending({ kind: "clear" })}
                    disabled={isSeeding || isClearing}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    {isClearing ? "Clearing…" : "🗑️ Clear All Data"}
                  </Button>
                  <Button
                    onClick={() => setPending({ kind: "clearAndSeed" })}
                    disabled={isSeeding || isClearing}
                    variant="outline"
                    className="border-red-400 bg-transparent text-red-300 hover:bg-red-600 hover:text-white font-bold"
                  >
                    {isSeeding || isClearing ? "Working…" : "🔄 Clear & Reseed"}
                  </Button>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Sample Ideas Preview */}
          {ideas.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">💡 Current Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {(showAllIdeas ? ideas : ideas.slice(0, PREVIEW_COUNT)).map((idea: Idea) => (
                    <div key={idea._id} className="bg-black/20 p-3 rounded-lg border border-cyan-400/10">
                      <h4 className="text-yellow-400 font-bold text-sm mb-1">{idea.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{idea.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded">
                          {plural(idea.votes, "upvote")}
                        </span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          {plural(teams.filter((team: Team) => team.ideaId === idea._id).length, "team")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => setPending({ kind: "deleteIdea", id: idea._id, title: idea.title })}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          Delete Idea
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <ShowAllToggle
                  shown={showAllIdeas ? ideas.length : Math.min(PREVIEW_COUNT, ideas.length)}
                  total={ideas.length}
                  noun="idea"
                  expanded={showAllIdeas}
                  onToggle={() => setShowAllIdeas((v) => !v)}
                />
              </CardContent>
            </Card>
          )}

          {/* Teams Preview */}
          {teams.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono">👥 Current Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {(showAllTeams ? teams : teams.slice(0, PREVIEW_COUNT)).map((team: Team) => (
                    <div key={team._id} className="bg-black/20 p-3 rounded-lg border border-cyan-400/10">
                      <h4 className="text-yellow-400 font-bold text-sm mb-1">{team.name}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{team.description || "No description"}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          team.status === 'forming' ? 'bg-yellow-500 text-black' :
                          team.status === 'idea-browsing' ? 'bg-blue-500 text-white' :
                          team.status === 'assembled' ? 'bg-green-500 text-white' :
                          team.status === 'ready' ? 'bg-purple-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {team.status ? TEAM_STATUS_LABELS[team.status] : "No status"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => setPending({ kind: "deleteTeam", id: team._id, name: team.name })}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          Delete Team
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <ShowAllToggle
                  shown={showAllTeams ? teams.length : Math.min(PREVIEW_COUNT, teams.length)}
                  total={teams.length}
                  noun="team"
                  expanded={showAllTeams}
                  onToggle={() => setShowAllTeams((v) => !v)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setDeleteConfirmText("");
          }
        }}
        title={
          pending?.kind === "clear"
            ? "Clear all hackathon data?"
            : pending?.kind === "clearAndSeed"
              ? "Clear all data and reseed?"
              : pending?.kind === "deleteIdea"
                ? "Delete this idea?"
                : "Delete this team?"
        }
        confirmLabel={
          pending?.kind === "clear"
            ? "Clear all data"
            : pending?.kind === "clearAndSeed"
              ? "Clear and reseed"
              : "Delete"
        }
        tone="destructive"
        onConfirm={() => {
          const action = pending;
          setDeleteConfirmText("");
          if (!action) return;
          if (action.kind === "clear") return handleClear();
          if (action.kind === "clearAndSeed") return handleClearAndSeed();
          if (action.kind === "deleteIdea") return handleAdminDeleteIdea(action.id);
          return handleAdminDeleteTeam(action.id);
        }}
        confirmDisabled={
          (pending?.kind === "clear" || pending?.kind === "clearAndSeed") && deleteConfirmText !== "DELETE"
        }
      >
        {pending?.kind === "clear" || pending?.kind === "clearAndSeed" ? (
          <>
            <p>
              This permanently deletes {plural(ideas.length, "idea")}, {plural(teams.length, "team")}, every upvote,
              every user profile and every team submission.
              {pending.kind === "clearAndSeed" && " Six sample ideas are added afterwards."}
            </p>
            <label htmlFor="confirm-delete-text" className="block font-semibold">
              Type DELETE to confirm
            </label>
            <Input
              id="confirm-delete-text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              autoComplete="off"
              className="bg-black/30 border-red-400/50 text-white"
            />
          </>
        ) : pending?.kind === "deleteIdea" ? (
          <p>“{pending.title}” will be removed from every team that picked it. This can&apos;t be undone.</p>
        ) : pending?.kind === "deleteTeam" ? (
          <p>“{pending.name}” and its members&apos; team membership will be removed. This can&apos;t be undone.</p>
        ) : null}
      </ConfirmDialog>
    </main>
  );
}

function ShowAllToggle({
  shown,
  total,
  noun,
  expanded,
  onToggle,
}: {
  shown: number;
  total: number;
  noun: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (total <= PREVIEW_COUNT) return null;
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
      <span>
        Showing {shown} of {plural(total, noun)}
      </span>
      <button type="button" onClick={onToggle} className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
        {expanded ? "Show fewer" : "Show all"}
      </button>
    </div>
  );
}
