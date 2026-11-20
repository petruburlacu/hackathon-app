import { describe, expect, it } from "vitest";
import { formatUkDayTime } from "./ukTime";

describe("formatUkDayTime", () => {
  it("formats the voting open time in UK time", () => {
    expect(formatUkDayTime(Date.parse("2026-12-03T17:00:00Z"))).toBe(
      "Thu 3 Dec, 17:00",
    );
  });

  it("applies British Summer Time", () => {
    expect(formatUkDayTime(Date.parse("2026-07-01T08:05:00Z"))).toBe(
      "Wed 1 Jul, 09:05",
    );
  });
});
