"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { EventTimes } from "@/lib/eventPhase";
import { getErrorMessage } from "@/lib/errorMessage";

const UK_TIME_ZONE = "Europe/London";

const ukParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: UK_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function ukWallClock(ms: number) {
  const parts = Object.fromEntries(
    ukParts.formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function toUkInput(ms: number): string {
  const { year, month, day, hour, minute } = ukWallClock(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function ukOffsetAt(ms: number): number {
  const w = ukWallClock(ms);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute) - Math.floor(ms / 60_000) * 60_000;
}

function fromUkInput(value: string): number {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  return wallAsUtc - ukOffsetAt(wallAsUtc - ukOffsetAt(wallAsUtc));
}

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
          <EventClockForm
            key={`${times.eventStartAt}-${times.submissionsCloseAt}-${times.votingClosesAt}`}
            times={times}
          />
        )}
      </CardContent>
    </Card>
  );
}
