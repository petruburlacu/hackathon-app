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
import { sameEventTimes } from "@/lib/testPhase";
import { formatUkDayTime, fromUkInput, toUkInput } from "@/lib/ukTime";

const TEST_MODE_MESSAGE = "Test mode: the event clock isn't on the real dates. Reset before launch.";

const TEST_PHASES = [
  { phase: "before", label: "Before start" },
  { phase: "submissions", label: "Submissions open" },
  { phase: "voting", label: "Voting open" },
  { phase: "closed", label: "Voting closed" },
] as const satisfies ReadonlyArray<{ phase: Phase; label: string }>;

type PendingAction =
  | { kind: "jump"; phase: Phase; label: string }
  | { kind: "reset" }
  | { kind: "saveDates"; times: EventTimes };

const FIELDS = [
  { key: "eventStartAt", label: "Event start (editing opens)" },
  { key: "submissionsCloseAt", label: "Submissions close (voting opens)" },
  { key: "votingClosesAt", label: "Voting closes" },
] as const satisfies ReadonlyArray<{ key: keyof EventTimes; label: string }>;

const timesKey = (times: EventTimes) =>
  `${times.eventStartAt}-${times.submissionsCloseAt}-${times.votingClosesAt}`;

function TimesForm({
  times,
  submitLabel,
  onSubmit,
}: {
  times: EventTimes;
  submitLabel: string;
  onSubmit: (times: EventTimes) => Promise<void> | void;
}) {
  const [values, setValues] = useState<Record<keyof EventTimes, string>>({
    eventStartAt: toUkInput(times.eventStartAt),
    submissionsCloseAt: toUkInput(times.submissionsCloseAt),
    votingClosesAt: toUkInput(times.votingClosesAt),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(values).some((value) => !value)) {
      toast.error("Fill in all three times");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        eventStartAt: fromUkInput(values.eventStartAt),
        submissionsCloseAt: fromUkInput(values.submissionsCloseAt),
        votingClosesAt: fromUkInput(values.votingClosesAt),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
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
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSaving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function confirmTitle(action: PendingAction | null): string {
  if (action?.kind === "jump") return `Jump to "${action.label}"?`;
  if (action?.kind === "saveDates") return "Save the event dates?";
  return "Reset to the event dates?";
}

function confirmLabel(action: PendingAction | null): string {
  if (action?.kind === "jump") return "Jump";
  if (action?.kind === "saveDates") return "Save";
  return "Reset";
}

function EventClockControls({ times, dates }: { times: EventTimes; dates: EventTimes }) {
  const updateEventTimes = useMutation(api.eventClock.updateEventTimes);
  const saveEventDates = useMutation(api.eventClock.saveEventDates);
  const resetToEventDates = useMutation(api.eventClock.resetToEventDates);
  const jumpToPhase = useMutation(api.eventClock.jumpToPhase);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const apply = async (action: PendingAction) => {
    setIsApplying(true);
    try {
      if (action.kind === "jump") {
        await jumpToPhase({ phase: action.phase });
        toast.success(`Event clock set to: ${action.label}`);
      } else if (action.kind === "saveDates") {
        await saveEventDates(action.times);
        toast.success("Event dates saved and applied to the event clock");
      } else {
        await resetToEventDates({});
        toast.success("Event clock reset to the event dates");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to change the event clock"));
    } finally {
      setIsApplying(false);
    }
  };

  const saveLiveClock = async (next: EventTimes) => {
    try {
      await updateEventTimes(next);
      toast.success("Event clock saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save the event clock"));
    }
  };

  return (
    <div className="space-y-6">
      {!sameEventTimes(times, dates) && (
        <div
          role="status"
          className="rounded-md border border-yellow-400/60 bg-yellow-400/15 p-3 text-sm font-semibold text-yellow-200"
        >
          {TEST_MODE_MESSAGE}
        </div>
      )}

      <section className="space-y-2">
        <h3 className="text-cyan-200 font-semibold">Event dates</h3>
        <p className="text-xs text-gray-400">
          The dates the event is meant to use. Saving them also puts the event clock on them.
        </p>
        <TimesForm
          key={timesKey(dates)}
          times={dates}
          submitLabel="Save event dates"
          onSubmit={(next) => setPending({ kind: "saveDates", times: next })}
        />
      </section>

      <section className="space-y-2 border-t border-cyan-400/10 pt-4">
        <h3 className="text-cyan-200 font-semibold">Event clock</h3>
        <p className="text-xs text-gray-400">
          The times the site enforces right now. Change them by hand, or use a test phase below.
        </p>
        <TimesForm
          key={timesKey(times)}
          times={times}
          submitLabel="Save times"
          onSubmit={saveLiveClock}
        />
      </section>

      <section className="space-y-2 border-t border-cyan-400/10 pt-4">
        <h3 className="text-cyan-200 font-semibold">Test phase</h3>
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
        <p className="text-xs text-gray-500">
          Each test phase moves only the event clock, setting all three times relative to now.
          Reset puts the clock back on the event dates: {formatUkDayTime(dates.eventStartAt)},{" "}
          {formatUkDayTime(dates.submissionsCloseAt)} and {formatUkDayTime(dates.votingClosesAt)}{" "}
          (UK time).
        </p>
      </section>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={confirmTitle(pending)}
        confirmLabel={confirmLabel(pending)}
        onConfirm={() => pending && apply(pending)}
      >
        <p>This changes the event clock for everyone using the site.</p>
      </ConfirmDialog>
    </div>
  );
}

function useTestMode(): { times: EventTimes; dates: EventTimes; testMode: boolean } | undefined {
  const times = useQuery(api.eventClock.getEventTimes);
  const dates = useQuery(api.eventClock.getEventDates);
  if (times === undefined || dates === undefined) return undefined;
  return { times, dates, testMode: !sameEventTimes(times, dates) };
}

export function TestModeNotice() {
  const clock = useTestMode();
  if (!clock?.testMode) return null;
  return (
    <div className="border-b border-yellow-400/40 bg-yellow-400/15 px-4 py-1.5 text-center text-xs font-semibold text-yellow-200">
      {TEST_MODE_MESSAGE}
    </div>
  );
}

export function EventClockCard() {
  const clock = useTestMode();

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 font-mono">⏰ Event Clock</CardTitle>
      </CardHeader>
      <CardContent>
        {clock === undefined ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : (
          <EventClockControls times={clock.times} dates={clock.dates} />
        )}
      </CardContent>
    </Card>
  );
}
