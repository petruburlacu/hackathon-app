import { describe, expect, it } from "vitest";
import { rankByPoints } from "./ranking";

const rows = (totals: number[]) =>
  totals.map((totalPoints, i) => ({ id: i, totalPoints }));

describe("rankByPoints", () => {
  it("gives tied totals the same rank and skips the next one", () => {
    expect(rankByPoints(rows([10, 7, 7, 3])).map((r) => r.rank)).toEqual([
      1, 2, 2, 4,
    ]);
  });

  it("orders by totalPoints descending and lists 0 points last", () => {
    const ranked = rankByPoints(rows([0, 7, 10, 3]));
    expect(ranked.map((r) => r.totalPoints)).toEqual([10, 7, 3, 0]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  it("ranks everyone 1 when nobody has points", () => {
    expect(rankByPoints(rows([0, 0, 0])).map((r) => r.rank)).toEqual([1, 1, 1]);
  });

  it("keeps input order within a tie", () => {
    expect(rankByPoints(rows([5, 5, 9])).map((r) => r.id)).toEqual([2, 0, 1]);
  });

  it("returns an empty list for no rows", () => {
    expect(rankByPoints([])).toEqual([]);
  });
});
