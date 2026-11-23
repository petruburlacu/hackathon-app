// Basic text sanitization to prevent layout-breaking and invisible control chars
export function sanitizeText(input: string, maxLength: number): string {
  // 1) Normalize to NFC to avoid weird composed forms
  const normalized = input.normalize("NFC");
  // 2) Remove control chars, formatting chars (incl. zero-width), surrogate code points,
  //    and non-spacing/enclosing marks that create glitchy text walls
  const stripped = normalized.replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Mn}\p{Me}]/gu, "");
  // 3) Collapse whitespace and trim
  const compact = stripped.replace(/\s+/g, " ").trim();
  // 4) Enforce max length
  return compact.slice(0, Math.max(0, maxLength));
}

// Like sanitizeText, but keeps single line breaks and paragraph gaps for multi-line bodies.
export function sanitizeMultilineText(input: string, maxLength: number): string {
  const lines = input
    .normalize("NFC")
    .split(/\r?\n/)
    .map((line) => sanitizeText(line, maxLength));
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, Math.max(0, maxLength));
}
