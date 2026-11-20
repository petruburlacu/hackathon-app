"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/submission/ConfirmDialog";
import type { EventTimes, Phase } from "@/lib/eventPhase";
import { getErrorMessage } from "@/lib/errorMessage";
import { REAL_EVENT_TIMES, isRealEventTimes } from "@/lib/testPhase";
import { fromUkInput, toUkInput } from "@/lib/ukTime";

const TEST_MODE_MESSAGE = "Test mode: the event clock isn't on the real dates. Reset before launch.";

const TEST_PHASES = [
  { phase: "before", label: "Before start" },
  { phase: "submissions", label: "Submissions open" },
  { phase: "voting", label: "Voting open" },
  { phase: "closed", label: "Voting closed" },
] as const satisfies ReadonlyArray<{ phase: Phase; label: string }>;

type PendingAction = { kind: "jump"; phase: Phase; label: string } | { kind: "reset" };

const FIELDS = [
  { key: "eventStartAt", label: "Event start (editing opens)" },
  { key: "submissionsCloseAt", label: "Submissions close (voting opens)" },
  { key: "votingClosesAt", label: "Voting closes" },
] as const satisfies ReadonlyArray<{ key: keyof EventTimes; label: string }>;

function EventClockForm({ times }: { times: EventTimes }) {
  const updateEventTimes = useMutation(api.eventClock.updateEventTimes);
  const [values, setValues] = useState<Record<keyof EventTimes, string>>({
    eventStartAt: toUkInput(times.eventStartAt),
    submissionsCloseAt: toUkInput(times.submissionsCloseAt),
    votingClosesAt: toUkInput(times.votingClosesAt),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (Object.values(values).some((value) => !value)) {
      toast.error("Fill in all three times");
      return;
    }
    setIsSaving(true);
    try {
      await updateEventTimes({
        eventStartAt: fromUkInput(values.eventStartAt),
        submissionsCloseAt: fromUkInput(values.submissionsCloseAt),
        votingClosesAt: fromUkInput(values.votingClosesAt),
      });
      toast.success("Event times saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save event times"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-yellow-300 font-semibold">{label}</span>
            <Input
              type="datetime-local"
              value={values[key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              className="bg-black/20 border-cyan-400/30 text-white"
            />
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-gray-500">All times are UK time (Europe/London).</div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSaving ? "Saving..." : "Save times"}
        </Button>
      </div>
    </div>
  );
}

function TestPhaseControls() {
  const jumpToPhase = useMutation(api.eventClock.jumpToPhase);
  const updateEventTimes = useMutation(api.eventClock.updateEventTimes);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const apply = async (action: PendingAction) => {
    setIsApplying(true);
    try {
      if (action.kind === "jump") {
        await jumpToPhase({ phase: action.phase });
        toast.success(`Event clock set to: ${action.label}`);
      } else {
        await updateEventTimes(REAL_EVENT_TIMES);
        toast.success("Event clock reset to the real event dates");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to change the event clock"));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-cyan-400/10 pt-4">
      <div className="text-yellow-300 font-semibold text-sm">Test phase</div>
      <div className="flex flex-wrap gap-2">
        {TEST_PHASES.map(({ phase, label }) => (
          <Button
            key={phase}
            size="sm"
            variant="outline"
            disabled={isApplying}
            onClick={() => setPending({ kind: "jump", phase, label })}
            className="border-cyan-400/40 bg-transparent text-cyan-200 hover:bg-cyan-400/10 hover:text-white"
          >
            {label}
          </Button>
        ))}
        <Button
          size="sm"
          disabled={isApplying}
          onClick={() => setPending({ kind: "reset" })}
          className="bg-yellow-400 text-black hover:bg-yellow-300"
        >
          Reset to event dates
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        Each test phase sets all three times relative to now. Reset puts back 2 Dec 10:00, 3 Dec
        17:00 and 6 Dec 23:59 (UK time).
      </div>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "jump"
            ? `Jump to "${pending.label}"?`
            : "Reset to the real event dates?"
        }
        confirmLabel={pending?.kind === "jump" ? "Jump" : "Reset"}
        onConfirm={() => pending && apply(pending)}
      >
        <p>This changes the event clock for everyone using the site.</p>
      </ConfirmDialog>
    </div>
  );
}

export function TestModeNotice() {
  const times = useQuery(api.eventClock.getEventTimes);
  if (times === undefined || isRealEventTimes(times)) return null;
  return (
    <div className="border-b border-yellow-400/40 bg-yellow-400/15 px-4 py-1.5 text-center text-xs font-semibold text-yellow-200">
      {TEST_MODE_MESSAGE}
    </div>
  );
}

export function EventClockCard() {
  const times = useQuery(api.eventClock.getEventTimes);

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 font-mono">⏰ Event Clock</CardTitle>
      </CardHeader>
      <CardContent>
        {times === undefined ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="space-y-4">
            {!isRealEventTimes(times) && (
              <div
                role="status"
                className="rounded-md border border-yellow-400/60 bg-yellow-400/15 p-3 text-sm font-semibold text-yellow-200"
              >
                {TEST_MODE_MESSAGE}
              </div>
            )}
            <EventClockForm
              key={`${times.eventStartAt}-${times.submissionsCloseAt}-${times.votingClosesAt}`}
              times={times}
            />
            <TestPhaseControls />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
