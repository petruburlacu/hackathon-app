export const LOCK_TTL_MS = 300_000;

export function isFresh(heartbeatAt: number, now: number): boolean {
  return now - heartbeatAt <= LOCK_TTL_MS;
}
