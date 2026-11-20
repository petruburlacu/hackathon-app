"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-400/30 bg-slate-900 p-6 text-gray-100 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-yellow-400">
            {title}
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-3 space-y-2 text-sm text-gray-200">
              {children}
            </div>
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button
                variant="outline"
                className="border-gray-500 bg-transparent text-gray-100 hover:bg-white/10 hover:text-white"
              >
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
