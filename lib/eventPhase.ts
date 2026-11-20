export type EventTimes = {
  eventStartAt: number;
  submissionsCloseAt: number;
  votingClosesAt: number;
};

export type Phase = "before" | "submissions" | "voting" | "closed";

export function eventPhase(times: EventTimes, now: number): Phase {
  if (now < times.eventStartAt) return "before";
  if (now < times.submissionsCloseAt) return "submissions";
  if (now < times.votingClosesAt) return "voting";
  return "closed";
}

// When the phase next flips, so the client can re-render exactly then; null once closed.
export function nextPhaseChangeAt(times: EventTimes, now: number): number | null {
  const boundaries = [times.eventStartAt, times.submissionsCloseAt, times.votingClosesAt];
  return boundaries.find((at) => at > now) ?? null;
}
