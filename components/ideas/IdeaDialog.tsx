"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export function IdeaDialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-xl border border-cyan-400/30 bg-slate-900 p-6 text-gray-100 shadow-xl"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-xl font-bold text-yellow-400 font-mono text-balance">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <Cross2Icon className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
