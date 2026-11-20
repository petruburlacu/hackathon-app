"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

export type Draft = { title: string; tagline: string; content: JSONContent };

const DEBOUNCE_MS = 1000;

function isDraft(value: unknown): value is Draft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.title === "string" &&
    typeof draft.tagline === "string" &&
    typeof draft.content === "object" &&
    draft.content !== null
  );
}

function readDraft(key: string): Draft | null {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Key-order independent, so a draft and the server copy compare equal however Convex orders fields.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sameDraft(a: Draft, b: Draft): boolean {
  return canonical(a) === canonical(b);
}

// Must only run in the browser: mount it below a component that renders after the Convex queries load.
export function useDraftBackup(teamId: string) {
  const key = `hackathon-draft:${teamId}`;
  const [draft] = useState(() => readDraft(key));
  const pending = useRef<Draft | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!pending.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(pending.current));
    } catch {
      // Storage full or blocked: the server copy is still the source of truth.
    }
    pending.current = null;
  }, [key]);

  const save = useCallback(
    (next: Draft) => {
      pending.current = next;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    pending.current = null;
    window.localStorage.removeItem(key);
  }, [key]);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return { draft, save, clear, flush };
}
