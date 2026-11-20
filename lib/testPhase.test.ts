import { describe, expect, it } from "vitest";
import { eventPhase, type Phase } from "./eventPhase";
import {
  DEFAULT_EVENT_TIMES,
  isValidEventTimes,
  sameEventTimes,
  testPhaseTimes,
} from "./testPhase";

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

describe("DEFAULT_EVENT_TIMES", () => {
  it("is 2 Dec 10:00, 3 Dec 17:00 and 6 Dec 23:59 UK time", () => {
    expect(DEFAULT_EVENT_TIMES).toEqual({
      eventStartAt: Date.parse("2026-12-02T10:00:00Z"),
      submissionsCloseAt: Date.parse("2026-12-03T17:00:00Z"),
      votingClosesAt: Date.parse("2026-12-06T23:59:00Z"),
    });
  });
});

describe("sameEventTimes", () => {
  it("is true only when all three times match", () => {
    const dates = testPhaseTimes("before", now);
    expect(sameEventTimes(dates, { ...dates })).toBe(true);
    expect(sameEventTimes(dates, testPhaseTimes("voting", now))).toBe(false);
    expect(sameEventTimes(dates, { ...dates, votingClosesAt: dates.votingClosesAt + 1 })).toBe(
      false,
    );
  });
});

describe("isValidEventTimes", () => {
  it("accepts start < submissions close < voting close", () => {
    expect(isValidEventTimes(DEFAULT_EVENT_TIMES)).toBe(true);
  });

  it("rejects times out of order or equal", () => {
    const { eventStartAt, submissionsCloseAt, votingClosesAt } = DEFAULT_EVENT_TIMES;
    expect(
      isValidEventTimes({ eventStartAt: submissionsCloseAt, submissionsCloseAt, votingClosesAt }),
    ).toBe(false);
    expect(
      isValidEventTimes({ eventStartAt, submissionsCloseAt: votingClosesAt + 1, votingClosesAt }),
    ).toBe(false);
  });

  it("rejects non-finite times", () => {
    expect(isValidEventTimes({ ...DEFAULT_EVENT_TIMES, votingClosesAt: Number.NaN })).toBe(false);
    expect(isValidEventTimes({ ...DEFAULT_EVENT_TIMES, votingClosesAt: Infinity })).toBe(false);
  });
});
