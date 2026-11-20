export const POINT_VALUES = [5, 4, 3, 2, 1] as const;

type BallotEntry = { points: number; submissionId: string; title: string };

export type BallotSlot = {
  points: number;
  // The submission holding this value, or null while it's still free to give.
  holder: { submissionId: string; title: string } | null;
};

export function ballotSlots(ballot: readonly BallotEntry[]): BallotSlot[] {
  return POINT_VALUES.map((points) => {
    const entry = ballot.find((e) => e.points === points);
    return {
      points,
      holder: entry
        ? { submissionId: entry.submissionId, title: entry.title }
        : null,
    };
  });
}

export function pointsGivenTo(
  ballot: readonly BallotEntry[],
  submissionId: string,
): number | null {
  return ballot.find((e) => e.submissionId === submissionId)?.points ?? null;
}
