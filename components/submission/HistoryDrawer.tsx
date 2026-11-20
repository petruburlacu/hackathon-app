"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errorMessage";
import { formatUkDateTime } from "@/lib/ukTime";
import { ConfirmDialog } from "./ConfirmDialog";
import { SubmissionReader } from "./SubmissionReader";

type HistoryDrawerProps = {
  canRestore: boolean;
  hasUnsavedChanges: boolean;
  onRestored: (version: Doc<"submissionVersions">) => void;
  onRestoreFailed: (message: string) => void;
};

export function HistoryDrawer({
  canRestore,
  hasUnsavedChanges,
  onRestored,
  onRestoreFailed,
}: HistoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Id<"submissionVersions"> | null>(
    null,
  );
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const versions = useQuery(api.submissions.listVersions, open ? {} : "skip");
  // A teammate's save can prune the selected version; getVersion would then throw.
  const selectedId = versions?.some((v) => v._id === selected)
    ? selected
    : null;
  const version = useQuery(
    api.submissions.getVersion,
    selectedId ? { versionId: selectedId } : "skip",
  );
  const restoreVersion = useMutation(api.submissions.restoreVersion);

  const restore = async () => {
    if (!version) return;
    setRestoring(true);
    try {
      await restoreVersion({ versionId: version._id });
      onRestored(version);
      toast.success(
        `Restored the version from ${formatUkDateTime(version.savedAt)}`,
      );
      setOpen(false);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not restore this version. Please try again.",
      );
      toast.error(message);
      onRestoreFailed(message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected(null);
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          className="border-cyan-400/50 bg-transparent text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-100"
        >
          History
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-cyan-400/30 bg-slate-900 text-gray-100 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyan-400/20 p-4">
            <Dialog.Title className="text-lg font-semibold text-yellow-400">
              Saved versions
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                className="text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Close
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="px-4 pt-3 text-sm text-gray-300">
            The last 5 saves are kept. Pick one to preview it.
          </Dialog.Description>
          <div className="flex-1 overflow-y-auto p-4">
            {versions === undefined ? (
              <p className="text-gray-400">Loading…</p>
            ) : versions.length === 0 ? (
              <p className="text-gray-400">Nothing saved yet.</p>
            ) : (
              <ul className="space-y-2">
                {versions.map((v, index) => (
                  <li key={v._id}>
                    <button
                      type="button"
                      onClick={() => setSelected(v._id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        v._id === selectedId
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-cyan-400/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="font-medium">
                        {formatUkDateTime(v.savedAt)}
                        {index === 0 && (
                          <span className="ml-2 text-xs text-yellow-300">
                            (current)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">
                        Saved by {v.savedBy} · {v.title}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedId && (
              <div className="mt-6 rounded-lg border border-cyan-400/20 bg-black/30 p-4">
                {version === undefined ? (
                  <p className="text-gray-400">Loading preview…</p>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-yellow-400">
                      {version.title}
                    </h3>
                    <p className="mb-4 text-gray-300">{version.tagline}</p>
                    <SubmissionReader content={version.content} />
                  </>
                )}
              </div>
            )}
          </div>
          {selectedId && version && (
            <div className="border-t border-cyan-400/20 p-4">
              {canRestore ? (
                <Button
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                  disabled={restoring}
                  onClick={() =>
                    hasUnsavedChanges ? setConfirming(true) : void restore()
                  }
                >
                  {restoring ? "Restoring…" : "Restore this version"}
                </Button>
              ) : (
                <p className="text-sm text-gray-300">
                  Start editing to restore an old version.
                </p>
              )}
            </div>
          )}
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title="Restore this version?"
            confirmLabel="Restore"
            onConfirm={() => void restore()}
          >
            <p>
              This replaces what&apos;s in the editor now, including changes you
              haven&apos;t saved.
            </p>
          </ConfirmDialog>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
