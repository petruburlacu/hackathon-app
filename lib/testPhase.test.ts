import { describe, expect, it } from "vitest";
import { eventPhase, type Phase } from "./eventPhase";
import { REAL_EVENT_TIMES, isRealEventTimes, testPhaseTimes } from "./testPhase";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.parse("2026-11-20T12:00:00Z");

describe("testPhaseTimes", () => {
  it("puts the event a day ahead for before start", () => {
    expect(testPhaseTimes("before", now)).toEqual({
      eventStartAt: now + DAY,
      submissionsCloseAt: now + 2 * DAY,
      votingClosesAt: now + 3 * DAY,
    });
  });

  it("opens submissions an hour ago", () => {
    expect(testPhaseTimes("submissions", now)).toEqual({
      eventStartAt: now - HOUR,
      submissionsCloseAt: now + DAY,
      votingClosesAt: now + 2 * DAY,
    });
  });

  it("opens voting an hour ago", () => {
    expect(testPhaseTimes("voting", now)).toEqual({
      eventStartAt: now - 2 * DAY,
      submissionsCloseAt: now - HOUR,
      votingClosesAt: now + DAY,
    });
  });

  it("closes voting an hour ago", () => {
    expect(testPhaseTimes("closed", now)).toEqual({
      eventStartAt: now - 3 * DAY,
      submissionsCloseAt: now - 2 * DAY,
      votingClosesAt: now - HOUR,
    });
  });

  it.each<Phase>(["before", "submissions", "voting", "closed"])(
    "lands in the %s phase with times in order",
    (phase) => {
      const times = testPhaseTimes(phase, now);
      expect(eventPhase(times, now)).toBe(phase);
      expect(times.eventStartAt).toBeLessThan(times.submissionsCloseAt);
      expect(times.submissionsCloseAt).toBeLessThan(times.votingClosesAt);
    },
  );
});

describe("REAL_EVENT_TIMES", () => {
  it("is 2 Dec 10:00, 3 Dec 17:00 and 6 Dec 23:59 UK time", () => {
    expect(REAL_EVENT_TIMES).toEqual({
      eventStartAt: Date.parse("2026-12-02T10:00:00Z"),
      submissionsCloseAt: Date.parse("2026-12-03T17:00:00Z"),
      votingClosesAt: Date.parse("2026-12-06T23:59:00Z"),
    });
  });
});

describe("isRealEventTimes", () => {
  it("is true only when all three times match the real dates", () => {
    expect(isRealEventTimes({ ...REAL_EVENT_TIMES })).toBe(true);
    expect(isRealEventTimes(testPhaseTimes("voting", now))).toBe(false);
    expect(
      isRealEventTimes({ ...REAL_EVENT_TIMES, votingClosesAt: REAL_EVENT_TIMES.votingClosesAt + 1 }),
    ).toBe(false);
  });
});
