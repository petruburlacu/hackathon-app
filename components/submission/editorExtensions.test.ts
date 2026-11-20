import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { isSafeHref, normaliseHref } from "../../lib/safeHref";
import { editorExtensions } from "./editorExtensions";

function docWithLink(href: string): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "click me",
            marks: [{ type: "link", attrs: { href } }],
          },
        ],
      },
    ],
  };
}

function render(href: string): string {
  return renderToHTMLString({
    extensions: editorExtensions({ editable: false }),
    content: docWithLink(href),
  });
}

describe("link rendering (review focus #5)", () => {
  it.each([
    "javascript:alert(1)",
    "  JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,x",
    "mailto:a@b.c",
    "/relative",
  ])("never renders %j as an href", (href) => {
    const html = render(href);
    expect(html).toContain("click me");
    expect(html).not.toMatch(/href="(?!")/);
  });

  it("renders an https link", () => {
    expect(render("https://example.com/a")).toContain(
      'href="https://example.com/a"',
    );
  });
});

describe("isSafeHref", () => {
  it("allows only http and https", () => {
    expect(isSafeHref("http://a.b")).toBe(true);
    expect(isSafeHref("https://a.b")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("ftp://a.b")).toBe(false);
    expect(isSafeHref("example.com")).toBe(false);
    expect(isSafeHref(null)).toBe(false);
  });
});

describe("normaliseHref", () => {
  it("adds https to a bare address and rejects other schemes", () => {
    expect(normaliseHref(" example.com/x ")).toBe("https://example.com/x");
    expect(normaliseHref("http://a.b")).toBe("http://a.b");
    expect(normaliseHref("javascript:alert(1)")).toBeNull();
    expect(normaliseHref("")).toBeNull();
  });
});
