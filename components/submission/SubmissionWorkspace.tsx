"use client";

import type { JSONContent } from "@tiptap/react";
import { useMutation } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { isFresh } from "@/lib/editLock";
import { getErrorMessage } from "@/lib/errorMessage";
import { eventPhase, type EventTimes } from "@/lib/eventPhase";
import { formatUkDateTime } from "@/lib/ukTime";
import { ConfirmDialog } from "./ConfirmDialog";
import { HistoryDrawer } from "./HistoryDrawer";
import { RecordingHelp } from "./RecordingHelp";
import { SubmissionEditor } from "./SubmissionEditor";
import { SubmissionReader } from "./SubmissionReader";
import { buildTemplate, emptySections } from "./template";
import { sameDraft, useDraftBackup, type Draft } from "./useDraftBackup";

const HEARTBEAT_MS = 60_000;
const LOCK_LOST = "You no longer hold the edit lock";
const KEPT = "Your unsaved text is kept in this browser.";
const TITLE_MAX = 80;
const TAGLINE_MAX = 140;

type Lock = { userId: Id<"users">; displayName: string; heartbeatAt: number };

type SubmissionWorkspaceProps = {
  teamId: Id<"teams">;
  teamName: string;
  myUserId: Id<"users">;
  isAdmin: boolean;
  times: EventTimes;
  reopenedUntil?: number;
  idea: { title: string; description: string } | null;
  lock?: Lock;
  saved: { summary: Doc<"submissions">; content: JSONContent | null } | null;
};

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function savedAgo(savedAt: number, now: number): string {
  const minutes = Math.floor((now - savedAt) / 60_000);
  if (minutes < 1) return "Saved just now";
  if (minutes < 60) return `Saved ${minutes} min ago`;
  return `Saved ${formatUkDateTime(savedAt)}`;
}

export function SubmissionWorkspace(props: SubmissionWorkspaceProps) {
  const {
    teamId,
    teamName,
    myUserId,
    isAdmin,
    times,
    reopenedUntil,
    idea,
    lock,
    saved,
  } = props;
  const now = useNow(15_000);
  const backup = useDraftBackup(teamId);

  const acquireEditLock = useMutation(api.submissions.acquireEditLock);
  const takeOverEditLock = useMutation(api.submissions.takeOverEditLock);
  const heartbeatEditLock = useMutation(api.submissions.heartbeatEditLock);
  const releaseEditLock = useMutation(api.submissions.releaseEditLock);
  const saveSubmission = useMutation(api.submissions.saveSubmission);

  const serverCopy = useMemo<Draft>(
    () =>
      saved
        ? {
            title: saved.summary.title,
            tagline: saved.summary.tagline,
            content: saved.content ?? buildTemplate(),
          }
        : { title: "", tagline: "", content: buildTemplate(idea?.description) },
    [saved, idea?.description],
  );

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [failure, setFailure] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [content, setContent] = useState<JSONContent>(serverCopy.content);
  const [editorSeed, setEditorSeed] = useState<{
    key: number;
    content: JSONContent;
  }>({ key: 0, content: serverCopy.content });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftOffer, setDraftOffer] = useState<Draft | null>(() =>
    backup.draft && !sameDraft(backup.draft, serverCopy) ? backup.draft : null,
  );
  const [emptyWarning, setEmptyWarning] = useState<{
    sections: string[];
    close: boolean;
  } | null>(null);
  const [confirmTakeOver, setConfirmTakeOver] = useState(false);

  const phase = eventPhase(times, now);
  const reopened = reopenedUntil !== undefined && now < reopenedUntil;
  const editingOpen =
    phase === "submissions" || (phase === "before" && isAdmin) || reopened;
  const otherEditor =
    lock && lock.userId !== myUserId && isFresh(lock.heartbeatAt, now)
      ? lock
      : undefined;

  // Derived, not stored: a take-over or the deadline arrives through query data and the ticking clock.
  // Order matters: once editing stops our own lock is released, so "no lock" must be checked last.
  const lostReason =
    mode !== "edit"
      ? null
      : !editingOpen
        ? `Submissions are closed. ${KEPT}`
        : lock && lock.userId !== myUserId
          ? `${lock.displayName} took over editing. ${KEPT}`
          : (failure ?? (lock ? null : `Your editing session ended. ${KEPT}`));
  const editing = mode === "edit" && lostReason === null;
  const lost = lostReason !== null;
  const current: Draft = { title, tagline, content };

  const begin = (start: Draft, startDirty: boolean) => {
    setTitle(start.title);
    setTagline(start.tagline);
    setContent(start.content);
    setEditorSeed((seed) => ({ key: seed.key + 1, content: start.content }));
    setDirty(startDirty);
    setFailure(null);
    setDraftOffer(null);
    setMode("edit");
  };

  const startEditing = async (start: Draft, startDirty: boolean) => {
    setBusy(true);
    try {
      const result = await acquireEditLock({});
      if (!result.ok) {
        toast.error(
          `${result.holder} is editing right now. You can take over if they've finished.`,
        );
        return;
      }
      begin(start, startDirty);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not start editing. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  const takeOver = async () => {
    setBusy(true);
    try {
      await takeOverEditLock({});
      begin(serverCopy, false);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Could not take over editing. Please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const restoreDraft = (draft: Draft) => {
    if (editing) {
      begin(draft, true);
    } else {
      void startEditing(draft, true);
    }
  };

  const discardDraft = () => {
    backup.clear();
    setDraftOffer(null);
  };

  const { flush } = backup;
  useEffect(() => {
    if (lost) flush();
  }, [lost, flush]);

  useEffect(() => {
    if (!editing) return;
    const release = () => void releaseEditLock({}).catch(() => {});
    const beat = setInterval(() => {
      heartbeatEditLock({}).catch((error: unknown) => {
        const message = getErrorMessage(error, "");
        setFailure(
          message === LOCK_LOST || !message
            ? `Your editing session ended. ${KEPT}`
            : `${message}. ${KEPT}`,
        );
      });
    }, HEARTBEAT_MS);
    window.addEventListener("pagehide", release);
    return () => {
      clearInterval(beat);
      window.removeEventListener("pagehide", release);
      release();
    };
  }, [editing, heartbeatEditLock, releaseEditLock]);

  useEffect(() => {
    if (!editing || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing, dirty]);

  const update = (next: Draft) => {
    setTitle(next.title);
    setTagline(next.tagline);
    setContent(next.content);
    setDirty(true);
    backup.save(next);
  };

  const doSave = async (close: boolean) => {
    setSaving(true);
    try {
      await saveSubmission({ title, tagline, content });
      backup.clear();
      setDirty(false);
      toast.success("Saved");
      if (close) setMode("view");
    } catch (error) {
      const message = getErrorMessage(error, `Could not save. ${KEPT}`);
      toast.error(message);
      if (message === LOCK_LOST)
        setFailure(`Someone else is editing now. ${KEPT}`);
    } finally {
      setSaving(false);
    }
  };

  const save = (close: boolean) => {
    if (close && !dirty) {
      setMode("view");
      return;
    }
    if (title.trim() === "") {
      toast.error("Add a title before saving.");
      return;
    }
    if (tagline.trim() === "") {
      toast.error("Add a one-line tagline before saving.");
      return;
    }
    const sections = emptySections(content);
    if (sections.length > 0) {
      setEmptyWarning({ sections, close });
      return;
    }
    void doSave(close);
  };

  const showLatest = () => {
    if (dirty && !sameDraft(current, serverCopy)) setDraftOffer(current);
    setFailure(null);
    setMode("view");
  };

  const status = editing
    ? dirty
      ? "You're editing. You have unsaved changes."
      : saved
        ? "You're editing. Everything is saved."
        : "You're editing. Not saved yet."
    : otherEditor
      ? `${otherEditor.displayName} is editing`
      : saved
        ? savedAgo(saved.summary.savedAt, now)
        : "Not saved yet";

  const shown = lost ? current : serverCopy;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
          Your team&apos;s submission
        </h1>
        <p className="text-cyan-200">{teamName}</p>
      </div>

      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-400/30 bg-slate-900/95 p-3 backdrop-blur-sm">
        <p className="text-sm text-gray-100" aria-live="polite">
          {status}
        </p>
        <div className="flex flex-wrap gap-2">
          <HistoryDrawer
            canRestore={editing}
            hasUnsavedChanges={dirty}
            onRestored={(version) => {
              backup.clear();
              begin(
                {
                  title: version.title,
                  tagline: version.tagline,
                  content: version.content,
                },
                false,
              );
            }}
            onRestoreFailed={(message) => {
              if (message === LOCK_LOST)
                setFailure(`Someone else is editing now. ${KEPT}`);
            }}
          />
          {editing ? (
            <>
              <Button
                variant="outline"
                className="border-yellow-400/60 bg-transparent text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200"
                disabled={saving}
                onClick={() => save(true)}
              >
                {dirty ? "Save and close" : "Stop editing"}
              </Button>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-300"
                disabled={saving || !dirty}
                onClick={() => save(false)}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            mode === "view" &&
            editingOpen &&
            !otherEditor && (
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-300"
                disabled={busy}
                onClick={() => void startEditing(serverCopy, false)}
              >
                Start editing
              </Button>
            )
          )}
        </div>
      </div>

      {phase === "before" && !isAdmin && (
        <Notice>
          Editing opens when the hackathon starts:{" "}
          {formatUkDateTime(times.eventStartAt)} (UK time).
        </Notice>
      )}
      {phase === "before" && isAdmin && (
        <Notice>
          The hackathon hasn&apos;t started yet. You can edit now because
          you&apos;re an admin.
        </Notice>
      )}
      {phase !== "before" && phase !== "submissions" && !reopened && (
        <Notice>
          Submissions are closed, so this write-up can no longer be changed.
        </Notice>
      )}
      {phase !== "before" &&
        phase !== "submissions" &&
        reopened &&
        reopenedUntil !== undefined && (
          <Notice>
            Editing has been reopened for your team until{" "}
            {formatUkDateTime(reopenedUntil)} (UK time).
          </Notice>
        )}

      {mode === "view" && otherEditor && (
        <Notice tone="info">
          <p>
            <strong>{otherEditor.displayName} is editing.</strong> You can read
            the last saved version below. Only one person can edit at a time.
          </p>
          {editingOpen && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-yellow-400/60 bg-transparent text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200"
              disabled={busy}
              onClick={() => setConfirmTakeOver(true)}
            >
              Take over editing
            </Button>
          )}
        </Notice>
      )}

      {lost && (
        <Notice tone="warning">
          <p>{lostReason}</p>
          <p className="mt-1 text-sm">
            Your text is shown below, read-only, so you can copy anything you
            need.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 border-yellow-400/60 bg-transparent text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200"
            onClick={showLatest}
          >
            Show the latest saved version
          </Button>
        </Notice>
      )}

      {draftOffer && !lost && (
        <Notice tone="warning">
          <p>
            <strong>Restore unsaved draft?</strong> This browser has changes
            that were never saved.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(editing || (editingOpen && !otherEditor)) && (
              <Button
                size="sm"
                className="bg-yellow-400 text-black hover:bg-yellow-300"
                disabled={busy}
                onClick={() => restoreDraft(draftOffer)}
              >
                Restore draft
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-gray-500 bg-transparent text-gray-100 hover:bg-white/10 hover:text-white"
              onClick={discardDraft}
            >
              Discard it
            </Button>
          </div>
        </Notice>
      )}

      <div className="space-y-1 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-4 text-sm text-gray-100">
        <p className="font-semibold text-yellow-300">
          Don&apos;t include customer names or confidential data; the site is
          public.
        </p>
        <p>
          Demo videos: 5 minutes max. <RecordingHelp />
        </p>
      </div>

      {idea && (
        <details className="rounded-lg border border-cyan-400/30 bg-black/30 p-4 text-gray-100">
          <summary className="cursor-pointer">
            <span className="text-sm text-gray-300">Based on the idea: </span>
            <span className="font-semibold text-cyan-200">{idea.title}</span>
          </summary>
          <p className="mt-2 whitespace-pre-line text-sm text-gray-300">
            {idea.description}
          </p>
        </details>
      )}

      <div className="space-y-4 rounded-lg border border-cyan-400/20 bg-black/40 p-4 text-gray-100">
        {editing ? (
          <>
            <Field label="Title" count={title.length} max={TITLE_MAX}>
              <Input
                id="submission-title"
                value={title}
                maxLength={TITLE_MAX}
                placeholder="Your project's name"
                onChange={(event) =>
                  update({ ...current, title: event.target.value })
                }
                className="border-cyan-400/30 bg-black/30 text-gray-100"
              />
            </Field>
            <Field label="Tagline" count={tagline.length} max={TAGLINE_MAX}>
              <Input
                id="submission-tagline"
                value={tagline}
                maxLength={TAGLINE_MAX}
                placeholder="One line that sums it up"
                onChange={(event) =>
                  update({ ...current, tagline: event.target.value })
                }
                className="border-cyan-400/30 bg-black/30 text-gray-100"
              />
            </Field>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">
              {shown.title || "No title yet"}
            </h2>
            <p className="text-gray-300">{shown.tagline || "No tagline yet"}</p>
          </div>
        )}
        <div
          className="rounded-md border border-dashed border-gray-600 p-3 text-sm text-gray-400"
          aria-disabled="true"
        >
          Cover image: coming soon
        </div>
      </div>

      {editing ? (
        <SubmissionEditor
          key={editorSeed.key}
          initialContent={editorSeed.content}
          onChange={(next) => update({ ...current, content: next })}
        />
      ) : saved || lost ? (
        <div className="rounded-lg border border-cyan-400/20 bg-black/40 px-4 py-3">
          <SubmissionReader content={shown.content} />
        </div>
      ) : (
        <div className="rounded-lg border border-cyan-400/20 bg-black/40 p-6 text-center text-gray-200">
          Nothing saved yet.{" "}
          {editingOpen && !otherEditor
            ? "Press Start editing to write your team's submission. We'll start you off with a template."
            : ""}
        </div>
      )}

      <ConfirmDialog
        open={emptyWarning !== null}
        onOpenChange={(open) => !open && setEmptyWarning(null)}
        title="Some sections are still empty"
        confirmLabel="Save anyway"
        cancelLabel="Keep editing"
        onConfirm={() => emptyWarning && void doSave(emptyWarning.close)}
      >
        <p>These sections have nothing in them yet:</p>
        <ul className="list-disc pl-5">
          {emptyWarning?.sections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ul>
        <p>You can save now and fill them in later.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmTakeOver}
        onOpenChange={setConfirmTakeOver}
        title={`Take over from ${otherEditor?.displayName ?? "your teammate"}?`}
        confirmLabel="Take over"
        onConfirm={() => void takeOver()}
      >
        <p>
          They&apos;ll stop being able to save. Anything they haven&apos;t saved
          stays in their browser, so nothing is lost.
        </p>
        <p>Check with them first if you can.</p>
      </ConfirmDialog>
    </div>
  );
}

function Notice({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "info" | "warning";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "border-gray-500/40 bg-black/30",
    info: "border-cyan-400/40 bg-cyan-400/10",
    warning: "border-orange-400/50 bg-orange-400/10",
  };
  return (
    <div
      role="status"
      className={`rounded-lg border p-4 text-gray-100 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  count,
  max,
  children,
}: {
  label: string;
  count: number;
  max: number;
  children: React.ReactNode;
}) {
  const id = `submission-${label.toLowerCase()}`;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-200">
          {label}
        </label>
        <span className="text-xs text-gray-400">
          {count}/{max}
        </span>
      </div>
      {children}
    </div>
  );
}
