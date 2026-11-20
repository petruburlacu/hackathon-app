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
