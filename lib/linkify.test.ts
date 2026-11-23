import { describe, expect, it } from "vitest";
import { splitLinks } from "./linkify";

describe("splitLinks", () => {
  it("splits http(s) URLs out of text", () => {
    expect(splitLinks("Sign up at https://example.com/a?b=1 today")).toEqual([
      { kind: "text", value: "Sign up at " },
      { kind: "link", value: "https://example.com/a?b=1" },
      { kind: "text", value: " today" },
    ]);
  });

  it("leaves trailing punctuation outside the link", () => {
    expect(splitLinks("See https://example.com.")).toEqual([
      { kind: "text", value: "See " },
      { kind: "link", value: "https://example.com" },
      { kind: "text", value: "." },
    ]);
  });

  it("ignores non-http schemes", () => {
    expect(splitLinks("javascript:alert(1)")).toEqual([
      { kind: "text", value: "javascript:alert(1)" },
    ]);
  });
});
