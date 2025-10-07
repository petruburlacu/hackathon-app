"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  StarIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { HackathonNav } from "@/components/HackathonNav";

export default function SuggestionsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSuggestionTitle, setNewSuggestionTitle] = useState("");
  const [newSuggestionDescription, setNewSuggestionDescription] = useState("");
  const [newSuggestionCategory, setNewSuggestionCategory] = useState<"general" | "improvement" | "feature" | "bug" | "other">("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "title">("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const viewer = useQuery(api.users.viewer);
  const suggestions = useQuery(api.hackathon.getSuggestions, { 
    category: categoryFilter === "all" ? undefined : categoryFilter as any,
    sortBy 
  }) || [];

  const createSuggestion = useMutation(api.hackathon.createSuggestion);
  const toggleSuggestionVote = useMutation(api.hackathon.toggleSuggestionVote);
  const voteStatus = useQuery(api.hackathon.getUserVoteStatus);
  const deleteSuggestion = useMutation(api.hackathon.deleteSuggestion);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Admin check - only allow admin@hackathon.com
  const isAdmin = viewer.email === "admin@hackathon.com";

  const handleCreateSuggestion = async () => {
    if (!newSuggestionTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!newSuggestionDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      await createSuggestion({
        title: newSuggestionTitle.trim(),
        description: newSuggestionDescription.trim(),
        category: newSuggestionCategory,
        isAnonymous,
      });
      setNewSuggestionTitle("");
      setNewSuggestionDescription("");
      setNewSuggestionCategory("general");
      setIsAnonymous(false);
      setShowCreateForm(false);
      toast.success("Suggestion submitted successfully!");
    } catch (error: any) {
      if (error.message?.includes("Title must be at least 3 characters")) {
        toast.error("Title must be at least 3 characters long");
      } else if (error.message?.includes("Description must be at least 10 characters")) {
        toast.error("Description must be at least 10 characters long");
      } else {
        toast.error("Failed to submit suggestion");
      }
    }
  };

  const handleToggleSuggestionVote = async (suggestionId: string) => {
    try {
      const result = await toggleSuggestionVote({ suggestionId: suggestionId as any });
      if (result.action === "added") {
        toast.success("Vote recorded!");
      } else {
        toast.success("Vote retracted!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle vote");
    }
  };

  const hasVotedForSuggestion = (suggestionId: string) => {
    if (!voteStatus) return false; // Still loading
    const suggestionIdStr = String(suggestionId);
    return voteStatus.suggestionVotes?.some(votedSuggestionId => String(votedSuggestionId) === suggestionIdStr) || false;
  };

  const handleDeleteSuggestion = async (suggestionId: string) => {
    if (!confirm("Are you sure you want to delete this suggestion?")) {
      return;
    }

    try {
      await deleteSuggestion({ suggestionId: suggestionId as any });
      toast.success("Suggestion deleted successfully!");
    } catch (error: any) {
      if (error.message?.includes("Only the author or admin can delete")) {
        toast.error("Only the author or admin can delete suggestions");
      } else {
        toast.error("Failed to delete suggestion");
      }
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general": return "bg-gray-500 text-white";
      case "improvement": return "bg-blue-500 text-white";
      case "feature": return "bg-green-500 text-white";
      case "bug": return "bg-red-500 text-white";
      case "other": return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general": return "💬";
      case "improvement": return "🔧";
      case "feature": return "✨";
      case "bug": return "🐛";
      case "other": return "📝";
      default: return "💬";
    }
  };

  return (
    <main className="flex min-h-screen grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="💡 SUGGESTION BOX 💡" />

      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Create New Suggestion */}
          {!showCreateForm ? (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4">
                  Share Your Ideas & Feedback
                </h3>
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
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Submit New Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div>
                  <label className="text-sm text-cyan-300 mb-2 block">Title *</label>
                  <Input
                    placeholder="Brief title for your suggestion..."
                    value={newSuggestionTitle}
                    onChange={(e) => setNewSuggestionTitle(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 3 characters</p>
                </div>
                
                <div>
                  <label className="text-sm text-cyan-300 mb-2 block">Description *</label>
                  <textarea
                    placeholder="Describe your suggestion in detail..."
                    value={newSuggestionDescription}
                    onChange={(e) => setNewSuggestionDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 10 characters</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-cyan-300 mb-2 block">Category</label>
                    <Select value={newSuggestionCategory} onValueChange={(value: any) => setNewSuggestionCategory(value)}>
                      <SelectTrigger className="bg-black/20 border-cyan-400/30 text-white">
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
                    disabled={!newSuggestionTitle.trim() || !newSuggestionDescription.trim()}
                  >
                    Submit Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <Input
                    placeholder="Search suggestions by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">💬 General</SelectItem>
                      <SelectItem value="improvement">🔧 Improvement</SelectItem>
                      <SelectItem value="feature">✨ Feature</SelectItem>
                      <SelectItem value="bug">🐛 Bug</SelectItem>
                      <SelectItem value="other">📝 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-40 bg-black/20 border-cyan-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="votes">Most Votes</SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="bg-cyan-500 text-white px-3 py-1 self-center">
                    {filteredSuggestions.length} suggestions
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions List */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion._id} className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-yellow-400 font-mono text-lg">{suggestion.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-pink-500 text-white">
                        {suggestion.votes} votes
                      </Badge>
                      <Badge className={getCategoryColor(suggestion.category)}>
                        {getCategoryIcon(suggestion.category)} {suggestion.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-cyan-200 mb-4 text-sm leading-relaxed">
                    {suggestion.description.length > 150 
                      ? `${suggestion.description.substring(0, 150)}...` 
                      : suggestion.description
                    }
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      by {suggestion.isAnonymous ? "Anonymous" : 
                           suggestion.authorId === viewer._id ? "You" : "Anonymous"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleToggleSuggestionVote(suggestion._id)}
                        className={`transition-all duration-300 transform hover:scale-105 ${
                          hasVotedForSuggestion(suggestion._id)
                            ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 shadow-lg shadow-green-500/25"
                            : "bg-pink-500 hover:bg-pink-600 text-white border-2 border-pink-300 shadow-lg shadow-pink-500/25"
                        }`}
                      >
                        <StarIcon className="mr-1 h-4 w-4" />
                        {hasVotedForSuggestion(suggestion._id) ? "Voted" : "Vote"}
                      </Button>
                      {(suggestion.authorId === viewer._id || isAdmin) && (
                        <Button
                          size="sm"
                          onClick={() => handleDeleteSuggestion(suggestion._id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredSuggestions.length === 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  {searchQuery ? "No Suggestions Found" : "No Suggestions Yet"}
                </h3>
                <p className="text-cyan-200 mb-6">
                  {searchQuery 
                    ? `No suggestions match your search for "${searchQuery}". Try a different search term.`
                    : "Be the first to submit a suggestion for improving the hackathon!"
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
