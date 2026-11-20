"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function ImagePicker({
  label,
  disabled,
  onPick,
  className,
}: {
  label: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className={className}
      >
        {label}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}
