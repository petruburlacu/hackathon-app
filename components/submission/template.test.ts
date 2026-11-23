import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/react";
import { buildTemplate, emptySections, TEMPLATE_SECTIONS } from "./template";

const HEADINGS = [
  "The idea",
  "What we built",
  "Demo",
  "How it works",
  "What's next",
  "GitHub repo",
];

function headingsOf(doc: JSONContent): string[] {
  return (doc.content ?? [])
    .filter((node) => node.type === "heading")
    .map((node) => node.content?.[0]?.text ?? "");
}

function typeUnder(
  doc: JSONContent,
  heading: string,
  text: string,
): JSONContent {
  const content = [...(doc.content ?? [])];
  const index = content.findIndex(
    (node) => node.type === "heading" && node.content?.[0]?.text === heading,
  );
  content[index + 1] = { type: "paragraph", content: [{ type: "text", text }] };
  return { ...doc, content };
}

describe("buildTemplate", () => {
  it("has the six headings in order", () => {
    expect(headingsOf(buildTemplate())).toEqual(HEADINGS);
    expect(TEMPLATE_SECTIONS.map((section) => section.heading)).toEqual(
      HEADINGS,
    );
  });

  it("puts the idea description under The idea", () => {
    const doc = buildTemplate("Find files faster.\n\nWith search.");
    expect(doc.content?.[1]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Find files faster." }],
    });
    expect(doc.content?.[2]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "With search." }],
    });
    expect(doc.content?.[3]?.type).toBe("heading");
    expect(emptySections(doc)).not.toContain("The idea");
  });
});

describe("emptySections", () => {
  it("reports all six headings for an untouched template", () => {
    expect(emptySections(buildTemplate())).toEqual(HEADINGS);
  });

  it("drops Demo once something is typed under it", () => {
    const doc = typeUnder(buildTemplate(), "Demo", "https://youtu.be/abc");
    expect(emptySections(doc)).toEqual(
      HEADINGS.filter((heading) => heading !== "Demo"),
    );
  });

  it("treats whitespace-only text as empty", () => {
    const doc = typeUnder(buildTemplate(), "Demo", "   ");
    expect(emptySections(doc)).toContain("Demo");
  });
});
