"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ballotSlots, pointsGivenTo } from "@/lib/ballot";
import { getErrorMessage } from "@/lib/errorMessage";
import { cn } from "@/lib/utils";

type PointButtonsProps = {
  submissionId: Id<"submissions">;
  isMine: boolean;
};

const FALLBACK_ERROR = "Couldn't save your points. Please try again.";

export function PointButtons({ submissionId, isMine }: PointButtonsProps) {
  const ballot = useQuery(api.voting.myBallot);
  const givePoints = useMutation(api.voting.givePoints);
  const removePoints = useMutation(api.voting.removePoints);
  const [busy, setBusy] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    points: number;
    title: string;
  } | null>(null);

  if (isMine) {
    return (
      <p className="rounded-lg border border-cyan-400/20 bg-black/30 px-3 py-3 text-center text-sm text-cyan-200">
        You can&apos;t vote for your own team
      </p>
    );
  }

  const given = ballot ? pointsGivenTo(ballot, submissionId) : null;
  const slots = ballotSlots(ballot ?? []);
  const inactive = busy || !ballot;

  const run = async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try {
      return await action();
    } catch (error) {
      toast.error(getErrorMessage(error, FALLBACK_ERROR));
    } finally {
      setBusy(false);
    }
  };

  const give = async (points: number, move: boolean) => {
    const result = await run(() => givePoints({ submissionId, points, move }));
    if (result && "conflict" in result) {
      setPendingMove({ points, title: result.conflict.title });
    }
  };

  const onPress = (points: number) => {
    if (inactive) return;
    if (given === points) {
      void run(() => removePoints({ submissionId, points }));
    } else {
      void give(points, false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        role="group"
        aria-label="Give points"
        className="grid grid-cols-5 gap-1.5"
      >
        {slots.map(({ points, holder }) => {
          const selected = given === points;
          const usedElsewhere = holder !== null && !selected;
          return (
            <button
              key={points}
              type="button"
              // aria-disabled, not disabled: a disabled button drops keyboard focus on every press.
              aria-disabled={inactive}
              aria-pressed={selected}
              aria-label={
                selected
                  ? `Remove your ${points} points`
                  : usedElsewhere
                    ? `Give ${points} points (now on ${holder.title})`
                    : `Give ${points} points`
              }
              title={usedElsewhere ? `Now on ${holder.title}` : undefined}
              onClick={() => onPress(points)}
              className={cn(
                "relative h-11 rounded-lg border font-mono text-lg font-bold transition-colors aria-disabled:cursor-wait aria-disabled:opacity-60",
                selected
                  ? "border-yellow-300 bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                  : usedElsewhere
                    ? "border-dashed border-cyan-400/30 bg-black/20 text-cyan-300/50 hover:border-yellow-400/60 hover:text-yellow-300"
                    : "border-cyan-400/40 bg-black/30 text-cyan-200 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300",
              )}
            >
              {points}
            </button>
          );
        })}
      </div>
      <p className="min-h-4 text-center text-xs text-gray-400">
        {given !== null
          ? `You gave ${given} points · tap ${given} again to take it back`
          : "Tap a number to give points"}
      </p>
      <ConfirmDialog
        open={pendingMove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        title={
          pendingMove
            ? `Move your ${pendingMove.points} points from ${pendingMove.title}?`
            : ""
        }
        confirmLabel="Move points"
        onConfirm={() => {
          if (pendingMove) void give(pendingMove.points, true);
        }}
      >
        <p>
          You can give each value to one project only. Moving it takes it away
          from {pendingMove?.title}.
        </p>
      </ConfirmDialog>
    </div>
  );
}
