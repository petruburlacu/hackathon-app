import { describe, expect, it } from "vitest";
import { ballotSlots, pointsGivenTo } from "./ballot";

const ballot = [
  { points: 5, submissionId: "a", title: "Alpha" },
  { points: 2, submissionId: "b", title: "Beta" },
];

describe("ballotSlots", () => {
  it("lists every value from 5 down to 1 with its holder", () => {
    expect(ballotSlots(ballot)).toEqual([
      { points: 5, holder: { submissionId: "a", title: "Alpha" } },
      { points: 4, holder: null },
      { points: 3, holder: null },
      { points: 2, holder: { submissionId: "b", title: "Beta" } },
      { points: 1, holder: null },
    ]);
  });

  it("marks every value free on an empty ballot", () => {
    expect(ballotSlots([]).every((slot) => slot.holder === null)).toBe(true);
  });
});

describe("pointsGivenTo", () => {
  it("returns the value given to a submission", () => {
    expect(pointsGivenTo(ballot, "b")).toBe(2);
  });

  it("returns null when nothing was given", () => {
    expect(pointsGivenTo(ballot, "c")).toBeNull();
  });
});
