"use client";

import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { plural } from "@/lib/plural";

export function UpvoteButton({
  count,
  upvoted,
  pending,
  onToggle,
}: {
  count: number;
  upvoted: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={upvoted}
      aria-busy={pending}
      aria-label={`${upvoted ? "Remove upvote" : "Upvote"} (${plural(count, "upvote")})`}
      className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300 ${
        upvoted
          ? "border-pink-500 bg-pink-500 text-white hover:bg-pink-600"
          : "border-pink-400/60 bg-transparent text-pink-300 hover:bg-pink-500/15"
      }`}
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : upvoted ? (
        <StarFilledIcon className="h-4 w-4" />
      ) : (
        <StarIcon className="h-4 w-4" />
      )}
      <span>{upvoted ? "Upvoted" : "Upvote"}</span>
      <span className="border-l border-current/40 pl-2 tabular-nums">
        {count}
      </span>
    </button>
  );
}
