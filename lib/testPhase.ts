import { DEFAULT_SUBMISSIONS_CLOSE, DEFAULT_VOTING_CLOSE, EVENT_START } from "./event";
import type { EventTimes, Phase } from "./eventPhase";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Fallback only: once an admin saves event dates, those win.
export const DEFAULT_EVENT_TIMES: EventTimes = {
  eventStartAt: EVENT_START.getTime(),
  submissionsCloseAt: DEFAULT_SUBMISSIONS_CLOSE.getTime(),
  votingClosesAt: DEFAULT_VOTING_CLOSE.getTime(),
};

const OFFSETS: Record<Phase, [number, number, number]> = {
  before: [DAY, 2 * DAY, 3 * DAY],
  submissions: [-HOUR, DAY, 2 * DAY],
  voting: [-2 * DAY, -HOUR, DAY],
  closed: [-3 * DAY, -2 * DAY, -HOUR],
};

export function testPhaseTimes(phase: Phase, now: number): EventTimes {
  const [start, close, votingClose] = OFFSETS[phase];
  return {
    eventStartAt: now + start,
    submissionsCloseAt: now + close,
    votingClosesAt: now + votingClose,
  };
}

export function sameEventTimes(a: EventTimes, b: EventTimes): boolean {
  return (
    a.eventStartAt === b.eventStartAt &&
    a.submissionsCloseAt === b.submissionsCloseAt &&
    a.votingClosesAt === b.votingClosesAt
  );
}

export function isValidEventTimes(times: EventTimes): boolean {
  return (
    [times.eventStartAt, times.submissionsCloseAt, times.votingClosesAt].every(Number.isFinite) &&
    times.eventStartAt < times.submissionsCloseAt &&
    times.submissionsCloseAt < times.votingClosesAt
  );
}
