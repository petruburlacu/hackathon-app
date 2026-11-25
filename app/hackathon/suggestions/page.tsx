"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { plural } from "@/lib/plural";
import { StarIcon, StarFilledIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";
import { FullScreenLoader } from "@/components/PixelatedLoader";

type Category = "general" | "improvement" | "feature" | "bug" | "other";

const TITLE_MIN = 3;
const DESCRIPTION_MIN = 10;

const CATEGORY_LABELS: Record<Category, string> = {
  general: "💬 General",
  improvement: "🔧 Improvement",
  feature: "✨ Feature",
  bug: "🐛 Bug",
  other: "📝 Other",
};

export default function SuggestionsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSuggestionTitle, setNewSuggestionTitle] = useState("");
  const [newSuggestionDescription, setNewSuggestionDescription] = useState("");
  const [newSuggestionCategory, setNewSuggestionCategory] = useState<Category>("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "title">("newest");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Id<"suggestions"> | null>(null);

  const viewer = useQuery(api.users.viewer);
  const suggestions = useQuery(api.hackathon.getSuggestions, {
    category: categoryFilter === "all" ? undefined : categoryFilter,
    sortBy,
  });

  const createSuggestion = useMutation(api.hackathon.createSuggestion);
  const toggleSuggestionVote = useMutation(api.hackathon.toggleSuggestionVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);
  const deleteSuggestion = useMutation(api.hackathon.deleteSuggestion);

  if (!viewer) {
    return <FullScreenLoader text="Loading feedback…" />;
  }

  const titleError =
    newSuggestionTitle.trim().length < TITLE_MIN ? `Title needs at least ${TITLE_MIN} characters.` : null;
  const descriptionError =
    newSuggestionDescription.trim().length < DESCRIPTION_MIN
      ? `Description needs at least ${DESCRIPTION_MIN} characters.`
      : null;

  const resetForm = () => {
    setNewSuggestionTitle("");
    setNewSuggestionDescription("");
    setNewSuggestionCategory("general");
    setIsAnonymous(false);
    setTriedSubmit(false);
    setShowCreateForm(false);
  };

  const handleCreateSuggestion = async () => {
    setTriedSubmit(true);
    if (titleError || descriptionError) return;

    try {
      await createSuggestion({
        title: newSuggestionTitle.trim(),
        description: newSuggestionDescription.trim(),
        category: newSuggestionCategory,
        isAnonymous,
      });
      resetForm();
      toast.success("Suggestion submitted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit suggestion"));
    }
  };

  const handleToggleUpvote = async (suggestionId: Id<"suggestions">) => {
    try {
      await toggleSuggestionVote({ suggestionId });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update upvote"));
    }
  };

  const hasUpvoted = (suggestionId: string) =>
    voteStatus?.suggestionVotes?.some((id) => String(id) === suggestionId) ?? false;

  const handleDeleteSuggestion = async (suggestionId: Id<"suggestions">) => {
    try {
      await deleteSuggestion({ suggestionId });
      toast.success("Suggestion deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete suggestion"));
    }
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const query = searchQuery.toLowerCase();
  const filteredSuggestions = (suggestions ?? []).filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(query) ||
      suggestion.description.toLowerCase().includes(query),
  );

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="💡 SUGGESTION BOX 💡" />

      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {!showCreateForm ? (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4" aria-hidden="true">📝</div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4">
                  Share Your Ideas & Feedback
                </h2>
                <p className="text-cyan-200 mb-4 sm:mb-6 text-sm sm:text-base">
                  Help us improve the hackathon experience! Submit suggestions, report bugs, or share ideas for new features.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Submit Suggestion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Submit New Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div>
                  <label htmlFor="suggestion-title" className="text-sm text-cyan-300 mb-2 block">Title *</label>
                  <Input
                    id="suggestion-title"
                    placeholder="Brief title for your suggestion…"
                    value={newSuggestionTitle}
                    onChange={(e) => setNewSuggestionTitle(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                    aria-invalid={triedSubmit && !!titleError}
                    aria-describedby="suggestion-title-hint"
                  />
                  <p
                    id="suggestion-title-hint"
                    className={`text-xs mt-1 ${triedSubmit && titleError ? "text-red-400" : "text-gray-400"}`}
                  >
                    {triedSubmit && titleError ? titleError : `Minimum ${TITLE_MIN} characters`}
                  </p>
                </div>

                <div>
                  <label htmlFor="suggestion-description" className="text-sm text-cyan-300 mb-2 block">Description *</label>
                  <textarea
                    id="suggestion-description"
                    placeholder="Describe your suggestion in detail…"
                    value={newSuggestionDescription}
                    onChange={(e) => setNewSuggestionDescription(e.target.value)}
                    rows={4}
                    aria-invalid={triedSubmit && !!descriptionError}
                    aria-describedby="suggestion-description-hint"
                    className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 resize-vertical focus:outline-hidden focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <p
                    id="suggestion-description-hint"
                    className={`text-xs mt-1 ${triedSubmit && descriptionError ? "text-red-400" : "text-gray-400"}`}
                  >
                    {triedSubmit && descriptionError ? descriptionError : `Minimum ${DESCRIPTION_MIN} characters`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label id="suggestion-category-label" className="text-sm text-cyan-300 mb-2 block">Category</label>
                    <Select value={newSuggestionCategory} onValueChange={(value: Category) => setNewSuggestionCategory(value)}>
                      <SelectTrigger aria-labelledby="suggestion-category-label" className="bg-black/20 border-cyan-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                        <SelectItem value="general">💬 General</SelectItem>
                        <SelectItem value="improvement">🔧 Improvement</SelectItem>
                        <SelectItem value="feature">✨ Feature Request</SelectItem>
                        <SelectItem value="bug">🐛 Bug Report</SelectItem>
                        <SelectItem value="other">📝 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6 sm:pt-8">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-cyan-400 bg-black/20 border-cyan-400/30 rounded focus:ring-cyan-400/50"
                    />
                    <label htmlFor="isAnonymous" className="text-sm text-cyan-300">
                      Submit anonymously
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCreateSuggestion}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3"
                  >
                    Submit Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <Input
                  type="search"
                  aria-label="Search suggestions"
                  placeholder="Search suggestions by title or description…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={categoryFilter} onValueChange={(value: Category | "all") => setCategoryFilter(value)}>
                    <SelectTrigger aria-label="Filter by category" className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: "newest" | "votes" | "title") => setSortBy(value)}>
                    <SelectTrigger aria-label="Sort by" className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="votes">Most upvoted</SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  {suggestions !== undefined && (
                    <span className="self-center text-sm text-gray-400 sm:ml-2">
                      {plural(filteredSuggestions.length, "suggestion")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {suggestions === undefined ? (
            <p className="text-center text-cyan-200 py-12" role="status">Loading suggestions…</p>
          ) : filteredSuggestions.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4" aria-hidden="true">💡</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                  {searchQuery ? "No Suggestions Found" : "No Suggestions Yet"}
                </h2>
                <p className="text-cyan-200 mb-6">
                  {searchQuery
                    ? `No suggestions match your search for “${searchQuery}”. Try a different search term.`
                    : "Be the first to submit a suggestion for improving the hackathon!"}
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
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSuggestions.map((suggestion) => {
                const upvoted = hasUpvoted(suggestion._id);
                const isExpanded = expanded.has(suggestion._id);
                const isLong = suggestion.description.length > 150;
                return (
                  <Card
                    key={suggestion._id}
                    className="flex flex-col bg-black/40 backdrop-blur-xs border-cyan-400/20 hover:border-cyan-400/40 transition-colors"
                  >
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-yellow-400 font-mono text-lg break-words">{suggestion.title}</CardTitle>
                      <span className="self-start rounded-full border border-gray-500 px-2 py-0.5 text-xs text-gray-300">
                        {CATEGORY_LABELS[suggestion.category]}
                      </span>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p
                        className={`text-cyan-200 text-sm leading-relaxed whitespace-pre-line break-words ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {suggestion.description}
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(suggestion._id)}
                          aria-expanded={isExpanded}
                          className="mt-1 self-start text-xs text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="min-w-0 truncate text-sm text-gray-400">
                          {suggestion.isMine
                            ? "by you"
                            : suggestion.authorName
                              ? `by ${suggestion.authorName}`
                              : "Anonymous"}
                        </span>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleToggleUpvote(suggestion._id)}
                            aria-pressed={upvoted}
                            aria-label={`${upvoted ? "Remove upvote" : "Upvote"}: ${plural(suggestion.votes, "upvote")}`}
                            className={`transition-colors border ${
                              upvoted
                                ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-300"
                                : "bg-transparent hover:bg-pink-500/20 text-pink-300 border-pink-400"
                            }`}
                          >
                            {upvoted ? (
                              <StarFilledIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                            ) : (
                              <StarIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="tabular-nums">{suggestion.votes}</span>
                          </Button>
                          {suggestion.canDelete && (
                            <Button
                              size="sm"
                              onClick={() => setPendingDelete(suggestion._id)}
                              aria-label="Delete suggestion"
                              className="bg-transparent border border-red-400 text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this suggestion?"
        confirmLabel="Delete suggestion"
        tone="destructive"
        onConfirm={() => pendingDelete && handleDeleteSuggestion(pendingDelete)}
      >
        <p>The suggestion and its upvotes will be removed. This can&apos;t be undone.</p>
      </ConfirmDialog>
    </main>
  );
}
