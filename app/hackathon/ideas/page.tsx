"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { plural } from "@/lib/plural";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import { FullScreenLoader } from "@/components/PixelatedLoader";
import { TeamsLockedNotice } from "@/components/TeamsLockedNotice";
import { IdeaDialog } from "@/components/ideas/IdeaDialog";
import { UpvoteButton } from "@/components/ideas/UpvoteButton";
import {
  EMPTY_IDEA_FORM,
  IdeaFormFields,
  parseTags,
  validateIdeaForm,
  type IdeaFormValues,
} from "@/components/ideas/IdeaFormFields";
import { useEventPhase } from "@/lib/useEventPhase";
import { teamsLocked } from "@/lib/eventPhase";
import Link from "next/link";

type Idea = Doc<"ideas">;
type SortKey = "votes" | "newest" | "title";

const panelClass = "bg-black/40 backdrop-blur-xs border-cyan-400/20";
const chipClass = "bg-white/10 text-gray-200 text-xs font-normal border-transparent";

export default function IdeasPage() {
  const settings = useQuery(api.hackathon.getSettings);
  const ideaSubmissionsEnabled = settings?.enableIdeaSubmissions ?? true;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createValues, setCreateValues] = useState<IdeaFormValues>(EMPTY_IDEA_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("votes");

  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editValues, setEditValues] = useState<IdeaFormValues>(EMPTY_IDEA_FORM);
  const [detailsIdeaId, setDetailsIdeaId] = useState<Id<"ideas"> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ idea: Idea; asAdmin: boolean } | null>(null);

  const [isCreatingIdea, setIsCreatingIdea] = useState(false);
  const [isUpdatingIdea, setIsUpdatingIdea] = useState(false);
  const [votingIdeaId, setVotingIdeaId] = useState<Id<"ideas"> | null>(null);

  const viewer = useQuery(api.users.viewer);
  const ideas = useQuery(api.hackathon.getIdeas);
  const teams = useQuery(api.hackathon.getTeams) ?? [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const phase = useEventPhase(useQuery(api.eventClock.getEventTimes));
  const locked = phase !== undefined && teamsLocked(phase);

  const createIdea = useMutation(api.hackathon.createIdea);
  const updateIdea = useMutation(api.hackathon.updateIdea);
  const toggleIdeaVote = useMutation(api.hackathon.toggleIdeaVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);
  const assignIdeaToTeam = useMutation(api.hackathon.assignIdeaToTeam);
  const removeIdeaFromTeam = useMutation(api.hackathon.removeIdeaFromTeam);
  const deleteIdea = useMutation(api.hackathon.deleteIdea);
  const adminDeleteIdea = useMutation(api.hackathon.adminDeleteIdea);

  if (!viewer || ideas === undefined) {
    return <FullScreenLoader text="Loading ideas…" />;
  }

  const isAdmin = viewer.isAdmin;
  // Server mutations compare idea.authorId with the auth user id, which is viewer._id.
  const isMine = (idea: Idea) => idea.authorId === viewer._id;
  const hasUpvoted = (ideaId: Id<"ideas">) => voteStatus?.ideaVotes?.some((id) => id === ideaId) ?? false;
  const teamCount = (ideaId: Id<"ideas">) => teams.filter((team) => team.ideaId === ideaId).length;
  const myTeam = myTeamDetails?.team;
  const canAssign = !locked && Boolean(myTeam) && Boolean(myTeamDetails?.isLeader);
  const detailsIdea = ideas.find((idea) => idea._id === detailsIdeaId) ?? null;

  const handleCreateIdea = async () => {
    const error = validateIdeaForm(createValues);
    if (error) {
      toast.error(error);
      return;
    }
    setIsCreatingIdea(true);
    try {
      await createIdea({
        title: createValues.title.trim(),
        description: createValues.description.trim(),
        category: createValues.category,
        tags: parseTags(createValues.tags),
      });
      setCreateValues(EMPTY_IDEA_FORM);
      setShowCreateForm(false);
      toast.success("Idea submitted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit idea"));
    } finally {
      setIsCreatingIdea(false);
    }
  };

  const query = searchQuery.toLowerCase();
  const filteredAndSortedIdeas = ideas
    .filter((idea) => {
      const matchesSearch =
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.tags?.some((tag) => tag.toLowerCase().includes(query));
      const matchesCategory = categoryFilter === "all" || idea.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.votes - a.votes || b.createdAt - a.createdAt;
      }
    });
  const isFiltering = searchQuery !== "" || categoryFilter !== "all";

  const handleToggleUpvote = async (ideaId: Id<"ideas">) => {
    setVotingIdeaId(ideaId);
    try {
      await toggleIdeaVote({ ideaId });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update upvote"));
    } finally {
      setVotingIdeaId(null);
    }
  };

  const handleAssignIdea = async (ideaId: Id<"ideas">) => {
    if (!myTeam) return;
    try {
      await assignIdeaToTeam({ teamId: myTeam._id, ideaId });
      toast.success("Idea assigned to your team");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign idea to team"));
    }
  };

  const handleRemoveIdea = async () => {
    if (!myTeam) return;
    try {
      await removeIdeaFromTeam({ teamId: myTeam._id });
      toast.success("Idea removed from your team");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove idea from team"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { idea, asAdmin } = pendingDelete;
    try {
      if (asAdmin) {
        await adminDeleteIdea({ ideaId: idea._id });
      } else {
        await deleteIdea({ ideaId: idea._id });
      }
      if (detailsIdeaId === idea._id) setDetailsIdeaId(null);
      toast.success("Idea deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete idea"));
    }
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setEditValues({
      title: idea.title,
      description: idea.description,
      category: idea.category ?? "",
      tags: idea.tags?.join(", ") ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingIdea) return;
    const error = validateIdeaForm(editValues);
    if (error) {
      toast.error(error);
      return;
    }
    setIsUpdatingIdea(true);
    try {
      await updateIdea({
        ideaId: editingIdea._id,
        title: editValues.title.trim(),
        description: editValues.description.trim(),
        category: editValues.category,
        tags: parseTags(editValues.tags),
      });
      setEditingIdea(null);
      toast.success("Idea updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update idea"));
    } finally {
      setIsUpdatingIdea(false);
    }
  };

  const ownerActions = (idea: Idea) => (
    <>
      {isMine(idea) && (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditIdea(idea)}
            className="text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <Pencil1Icon className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPendingDelete({ idea, asAdmin: false })}
            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <TrashIcon className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </>
      )}
      {isAdmin && !isMine(idea) && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPendingDelete({ idea, asAdmin: true })}
          className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          <TrashIcon className="mr-1 h-4 w-4" />
          Delete (admin)
        </Button>
      )}
    </>
  );

  const tagChips = (idea: Idea) =>
    (idea.category || (idea.tags?.length ?? 0) > 0) && (
      <div className="flex flex-wrap gap-2">
        {idea.category && <Badge variant="secondary" className={chipClass}>{idea.category}</Badge>}
        {idea.tags?.map((tag) => (
          <Badge key={tag} variant="secondary" className={chipClass}>#{tag}</Badge>
        ))}
      </div>
    );

  const teamNote = (idea: Idea) => {
    const count = teamCount(idea._id);
    return count > 0 ? <span className="text-xs text-blue-300">Picked by {plural(count, "team")}</span> : null;
  };

  const assignmentRow = (idea: Idea) => {
    if (myTeam?.ideaId === idea._id) {
      return (
        <div className="flex items-center justify-between rounded border border-green-400/20 bg-green-500/10 px-2 py-1">
          <span className="text-xs font-medium text-green-300">✅ Your team&apos;s idea</span>
          {myTeamDetails?.isLeader && !locked && (
            <Button size="sm" variant="ghost" onClick={handleRemoveIdea} className="h-7 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200">
              Remove
            </Button>
          )}
        </div>
      );
    }
    if (canAssign) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAssignIdea(idea._id)}
          className="w-full border-blue-400/60 bg-transparent text-blue-300 hover:bg-blue-400/10 hover:text-blue-200"
        >
          Pick for my team
        </Button>
      );
    }
    return null;
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="💡 IDEAS BOARD 💡" />

      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {phase !== undefined && phase !== "before" && (
            <p className="rounded-lg border border-cyan-400/30 bg-black/40 px-4 py-3 text-sm text-cyan-200">
              Upvotes only help teams pick an idea. They don&apos;t count in the hackathon vote.{" "}
              <Link href="/hackathon/submissions" className="font-bold text-yellow-300 underline">
                See the submissions
              </Link>
            </p>
          )}
          {locked && myTeamDetails?.isLeader && <TeamsLockedNotice />}

          {ideaSubmissionsEnabled && !showCreateForm ? (
            <Card className={panelClass}>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4" aria-hidden>💡</div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 hackathon-title">
                  Share Your Ideas
                </h2>
                <p className="text-cyan-200 mb-4 sm:mb-6 text-sm sm:text-base hackathon-text">
                  Have an idea for the hackathon? Submit it and let everyone upvote it.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Submit New Idea
                </Button>
              </CardContent>
            </Card>
          ) : ideaSubmissionsEnabled ? (
            <Card id="create-idea-form" className={panelClass}>
              <CardHeader>
                <h2 className="text-yellow-400 font-mono font-semibold flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Submit New Idea
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <IdeaFormFields idPrefix="new-idea" values={createValues} onChange={setCreateValues} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCreateIdea}
                    disabled={isCreatingIdea}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 disabled:opacity-50"
                  >
                    {isCreatingIdea ? "Submitting…" : "Submit Idea"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateValues(EMPTY_IDEA_FORM);
                    }}
                    disabled={isCreatingIdea}
                    className="border-gray-400 bg-transparent text-gray-300 hover:bg-gray-400 hover:text-black py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={panelClass}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl sm:text-6xl mb-3" aria-hidden>⛔</div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 hackathon-title">
                  Idea submissions are closed
                </h2>
                <p className="text-cyan-200 text-sm">
                  You can still browse, search, and upvote existing ideas.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className={panelClass}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <Input
                  type="search"
                  aria-label="Search ideas"
                  placeholder="Search ideas by title, description, or tags…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger aria-label="Filter by category" className="w-full sm:w-44 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="all">All categories</SelectItem>
                      {Array.from(new Set(ideas.map((idea) => idea.category)))
                        .filter((category): category is string => Boolean(category))
                        .sort()
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: SortKey) => setSortBy(value)}>
                    <SelectTrigger aria-label="Sort ideas" className="w-full sm:w-44 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="votes">Most upvotes</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-400 sm:ml-2" aria-live="polite">
                    {isFiltering
                      ? `${plural(filteredAndSortedIdeas.length, "idea")} of ${ideas.length}`
                      : plural(ideas.length, "idea")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredAndSortedIdeas.length === 0 ? (
            <Card className={panelClass}>
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6" aria-hidden>💡</div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 hackathon-title">
                  {isFiltering ? "No Ideas Found" : "No Ideas Yet"}
                </h2>
                <p className="text-cyan-200 mb-6 sm:mb-8 text-sm sm:text-base hackathon-text">
                  {isFiltering
                    ? "No ideas match your search or filter. Try a different term or category."
                    : "Be the first to submit an idea for the hackathon."}
                </p>
                {isFiltering && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedIdeas.map((idea) => (
                <li key={idea._id}>
                  <Card className={`${panelClass} hover:border-cyan-400/50 transition-colors flex flex-col h-full`}>
                    <CardHeader className="shrink-0 space-y-3">
                      <CardTitle className="text-yellow-400 font-mono text-lg leading-snug text-balance wrap-break-word">
                        <h3>
                          <button
                            type="button"
                            onClick={() => setDetailsIdeaId(idea._id)}
                            className="text-left hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-cyan-400 rounded-sm"
                          >
                            {idea.title}
                          </button>
                        </h3>
                      </CardTitle>
                      {tagChips(idea)}
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 gap-3">
                      <p className="flex-1 text-cyan-200 text-sm leading-relaxed line-clamp-4 wrap-break-word">
                        {idea.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDetailsIdeaId(idea._id)}
                        className="self-start text-sm text-cyan-300 underline underline-offset-4 hover:text-cyan-100"
                      >
                        Read more
                      </button>

                      {assignmentRow(idea)}

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cyan-400/20 pt-3">
                        <UpvoteButton
                          count={idea.votes}
                          upvoted={hasUpvoted(idea._id)}
                          pending={votingIdeaId === idea._id}
                          onToggle={() => handleToggleUpvote(idea._id)}
                        />
                        <div className="flex flex-col items-end gap-0.5 text-right">
                          {isMine(idea) && <span className="text-xs text-yellow-300">Your idea</span>}
                          {teamNote(idea)}
                        </div>
                      </div>
                      {(isMine(idea) || isAdmin) && (
                        <div className="-mx-2 flex flex-wrap gap-1">{ownerActions(idea)}</div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <IdeaDialog
        open={detailsIdea !== null}
        onOpenChange={(open) => !open && setDetailsIdeaId(null)}
        title={detailsIdea?.title ?? ""}
      >
        {detailsIdea && (
          <div className="space-y-4">
            {tagChips(detailsIdea)}
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-cyan-100">
              {detailsIdea.description}
            </p>
            {assignmentRow(detailsIdea)}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cyan-400/20 pt-4">
              <UpvoteButton
                count={detailsIdea.votes}
                upvoted={hasUpvoted(detailsIdea._id)}
                pending={votingIdeaId === detailsIdea._id}
                onToggle={() => handleToggleUpvote(detailsIdea._id)}
              />
              <div className="flex flex-col items-end gap-0.5 text-right">
                {isMine(detailsIdea) && <span className="text-xs text-yellow-300">Your idea</span>}
                {teamNote(detailsIdea)}
              </div>
            </div>
            {(isMine(detailsIdea) || isAdmin) && (
              <div className="-mx-2 flex flex-wrap gap-1">{ownerActions(detailsIdea)}</div>
            )}
          </div>
        )}
      </IdeaDialog>

      <IdeaDialog
        open={editingIdea !== null}
        onOpenChange={(open) => !open && setEditingIdea(null)}
        title="Edit Idea"
      >
        <div className="space-y-4">
          <IdeaFormFields idPrefix="edit-idea" values={editValues} onChange={setEditValues} />
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdatingIdea}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold flex-1"
            >
              {isUpdatingIdea ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              onClick={() => setEditingIdea(null)}
              variant="outline"
              className="border-gray-400 bg-transparent text-gray-300 hover:bg-gray-400 hover:text-black flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </IdeaDialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete?.asAdmin ? "Delete this idea as admin?" : "Delete your idea?"}
        confirmLabel="Delete Idea"
        tone="destructive"
        onConfirm={handleConfirmDelete}
      >
        <p>
          &ldquo;{pendingDelete?.idea.title}&rdquo; and its upvotes will be removed
          {pendingDelete?.asAdmin ? ", including from any team that picked it" : ""}. This can&apos;t be undone.
        </p>
      </ConfirmDialog>
    </main>
  );
}
