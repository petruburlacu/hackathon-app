import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("plural", () => {
  it("uses the singular for exactly one", () => {
    expect(plural(1, "upvote")).toBe("1 upvote");
  });

  it("adds s for zero and many", () => {
    expect(plural(0, "team")).toBe("0 teams");
    expect(plural(3, "idea")).toBe("3 ideas");
  });

  it("uses a given plural form", () => {
    expect(plural(2, "person", "people")).toBe("2 people");
    expect(plural(1, "person", "people")).toBe("1 person");
  });
});
