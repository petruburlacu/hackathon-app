export type TextPart = { kind: "text" | "link"; value: string };

const URL_PATTERN = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]'"]/g;

export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last)
      parts.push({ kind: "text", value: text.slice(last, start) });
    parts.push({ kind: "link", value: match[0] });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}
