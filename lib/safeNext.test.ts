import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNext";

describe("safeNextPath", () => {
  it.each([
    ["/hackathon/submissions", "/hackathon/submissions"],
    [
      "/hackathon/submissions/abc?tab=1#top",
      "/hackathon/submissions/abc?tab=1#top",
    ],
    ["/hackathon", "/hackathon"],
  ])("keeps the in-app path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    null,
    "",
    "hackathon",
    "https://evil.example/hackathon",
    "//evil.example/hackathon",
    "/\\evil.example",
    "/%2F%2Fevil.example",
    "javascript:alert(1)",
    "/signin",
    "/",
  ])("falls back to /hackathon for %s", (input) => {
    expect(safeNextPath(input)).toBe("/hackathon");
  });
});
