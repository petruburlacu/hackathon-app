export type Ranked<T> = T & { rank: number };

// Competition ranking on totalPoints only: tied totals share a rank and the next rank skips (1, 2, 2, 4).
export function rankByPoints<T extends { totalPoints: number }>(
  rows: readonly T[],
): Ranked<T>[] {
  const sorted = [...rows].sort((a, b) => b.totalPoints - a.totalPoints);
  return sorted.map((row, index) => {
    let first = index;
    while (first > 0 && sorted[first - 1].totalPoints === row.totalPoints)
      first--;
    return { ...row, rank: first + 1 };
  });
}
