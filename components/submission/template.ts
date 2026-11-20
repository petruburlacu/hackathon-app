import type { JSONContent } from "@tiptap/react";

export const TEMPLATE_SECTIONS = [
  {
    heading: "The idea",
    hint: "What problem does it solve, and who is it for?",
  },
  {
    heading: "What we built",
    hint: "Describe what you made. Screenshots help.",
  },
  {
    heading: "Demo",
    hint: "Paste a link to your demo video. Demo videos: 5 minutes max.",
  },
  {
    heading: "How it works",
    hint: "The main parts and how they fit together. Keep it simple.",
  },
  { heading: "What's next", hint: "What would you do with more time?" },
  {
    heading: "Links & references",
    hint: "Repos, docs, or anything else worth a look.",
  },
] as const;

const SECTION_LEVEL = 2;

// Non-text nodes that fill a section on their own. The image (PR 4) and video (PR 5) nodes add their type here.
const CONTENT_NODE_TYPES = new Set<string>();

function paragraph(text?: string): JSONContent {
  return text
    ? { type: "paragraph", content: [{ type: "text", text }] }
    : { type: "paragraph" };
}

function ideaParagraphs(ideaDescription?: string): JSONContent[] {
  const lines = (ideaDescription ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  return lines.length > 0
    ? lines.map((line) => paragraph(line))
    : [paragraph()];
}

export function buildTemplate(ideaDescription?: string): JSONContent {
  return {
    type: "doc",
    content: TEMPLATE_SECTIONS.flatMap(({ heading }, index) => [
      {
        type: "heading",
        attrs: { level: SECTION_LEVEL },
        content: [{ type: "text", text: heading }],
      },
      ...(index === 0 ? ideaParagraphs(ideaDescription) : [paragraph()]),
    ]),
  };
}

function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textOf).join("");
}

function hasContent(node: JSONContent): boolean {
  if (node.type === "text") return (node.text ?? "").trim() !== "";
  if (node.type && CONTENT_NODE_TYPES.has(node.type)) return true;
  return (node.content ?? []).some(hasContent);
}

function isSectionHeading(node: JSONContent): boolean {
  return node.type === "heading" && node.attrs?.level === SECTION_LEVEL;
}

export function emptySections(doc: JSONContent): string[] {
  const empty: string[] = [];
  let current: { heading: string; filled: boolean } | null = null;
  const close = () => {
    if (current && !current.filled) empty.push(current.heading);
  };
  for (const node of doc.content ?? []) {
    if (isSectionHeading(node)) {
      close();
      current = { heading: textOf(node).trim(), filled: false };
    } else if (current && hasContent(node)) {
      current.filled = true;
    }
  }
  close();
  return empty;
}
