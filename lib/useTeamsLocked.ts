"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { teamsLocked } from "./eventPhase";
import { useEventPhase } from "./useEventPhase";

// False while the clock loads; the server rejects locked actions regardless.
export function useTeamsLocked(): boolean {
  const phase = useEventPhase(useQuery(api.eventClock.getEventTimes));
  return phase !== undefined && teamsLocked(phase);
}
