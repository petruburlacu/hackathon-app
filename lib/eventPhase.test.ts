import { describe, expect, it } from "vitest";
import { eventPhase, nextPhaseChangeAt, teamsLocked, type EventTimes } from "./eventPhase";

const times: EventTimes = {
  eventStartAt: Date.parse("2026-12-02T10:00:00Z"),
  submissionsCloseAt: Date.parse("2026-12-03T17:00:00Z"),
  votingClosesAt: Date.parse("2026-12-06T23:59:00Z"),
};

describe("eventPhase", () => {
  it("is before until the event starts", () => {
    expect(eventPhase(times, times.eventStartAt - 1)).toBe("before");
  });

  it("opens submissions exactly at the event start", () => {
    expect(eventPhase(times, times.eventStartAt)).toBe("submissions");
    expect(eventPhase(times, times.submissionsCloseAt - 1)).toBe("submissions");
  });

  it("opens voting exactly when submissions close", () => {
    expect(eventPhase(times, times.submissionsCloseAt)).toBe("voting");
    expect(eventPhase(times, times.votingClosesAt - 1)).toBe("voting");
  });

  it("is closed from the voting close onwards", () => {
    expect(eventPhase(times, times.votingClosesAt)).toBe("closed");
  });
});

describe("nextPhaseChangeAt", () => {
  it("returns the next boundary strictly after now", () => {
    expect(nextPhaseChangeAt(times, times.eventStartAt - 1)).toBe(times.eventStartAt);
    expect(nextPhaseChangeAt(times, times.eventStartAt)).toBe(times.submissionsCloseAt);
    expect(nextPhaseChangeAt(times, times.submissionsCloseAt)).toBe(times.votingClosesAt);
  });

  it("returns null once voting has closed", () => {
    expect(nextPhaseChangeAt(times, times.votingClosesAt)).toBeNull();
  });
});

describe("teamsLocked", () => {
  it("keeps teams open until submissions close", () => {
    expect(teamsLocked("before")).toBe(false);
    expect(teamsLocked("submissions")).toBe(false);
  });

  it("locks teams from the submission deadline onwards", () => {
    expect(teamsLocked("voting")).toBe(true);
    expect(teamsLocked("closed")).toBe(true);
  });
});
