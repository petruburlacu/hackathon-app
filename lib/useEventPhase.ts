"use client";

import { useEffect, useState } from "react";
import {
  eventPhase,
  nextPhaseChangeAt,
  type EventTimes,
  type Phase,
} from "./eventPhase";

// setTimeout overflows past ~24.8 days and fires at once, so long waits are split.
const MAX_TIMEOUT_MS = 2_147_483_647;

// Queries don't re-run as time passes, so the client flips the phase itself at each boundary.
export function useEventPhase(
  times: EventTimes | undefined,
): Phase | undefined {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!times) return;
    const current = Date.now();
    // `now` goes stale between boundaries; when an admin moves the times, re-read the clock at once.
    const stale = eventPhase(times, current) !== eventPhase(times, now);
    const next = nextPhaseChangeAt(times, current);
    if (!stale && next === null) return;
    const delay =
      stale || next === null ? 0 : Math.min(next - current, MAX_TIMEOUT_MS);
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [times, now]);

  // Timers stall while a laptop sleeps; re-read the clock when the tab comes back.
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return times ? eventPhase(times, now) : undefined;
}
