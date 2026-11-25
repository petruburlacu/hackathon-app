"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useId, useState } from "react";

type UrlDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  hint: string;
  initialValue?: string;
  submitLabel: string;
  validate: (value: string) => string | null;
  onSubmit: (value: string) => void;
};

export function UrlDialog({
  open,
  onOpenChange,
  ...formProps
}: UrlDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-400/30 bg-slate-900 p-6 text-gray-100 shadow-xl">
          <UrlForm {...formProps} onDone={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UrlForm({
  title,
  label,
  hint,
  initialValue = "",
  submitLabel,
  validate,
  onSubmit,
  onDone,
}: Omit<UrlDialogProps, "open" | "onOpenChange"> & { onDone: () => void }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const hintId = useId();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const problem = validate(value);
        if (problem) {
          setError(problem);
          return;
        }
        onDone();
        onSubmit(value);
      }}
    >
      <Dialog.Title className="text-lg font-semibold text-yellow-400">
        {title}
      </Dialog.Title>
      <Dialog.Description className="sr-only">{hint}</Dialog.Description>
      <label htmlFor={inputId} className="mt-4 block text-sm text-cyan-300">
        {label}
      </label>
      <input
        id={inputId}
        type="url"
        inputMode="url"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        placeholder="https://…"
        aria-invalid={error !== null}
        aria-describedby={hintId}
        className="mt-2 flex h-9 w-full rounded-md border border-cyan-400/30 bg-black/30 px-3 py-1 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      />
      <p
        id={hintId}
        aria-live="polite"
        className={`mt-2 text-xs ${error ? "text-red-400" : "text-gray-400"}`}
      >
        {error ?? hint}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Dialog.Close asChild>
          <button
            type="button"
            className="rounded-md border border-gray-500 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-white/10"
          >
            Cancel
          </button>
        </Dialog.Close>
        <button
          type="submit"
          className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
