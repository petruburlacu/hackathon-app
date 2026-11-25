import { describe, expect, it } from "vitest";
import { roleBadgeClass, roleLabel } from "./roleLabel";

describe("roleLabel", () => {
  it("labels each role", () => {
    expect(roleLabel("dev")).toBe("💻 Developer");
    expect(roleLabel("non-dev")).toBe("🎨 Non-Developer");
    expect(roleLabel("admin")).toBe("🚨 Admin");
  });
});

describe("roleBadgeClass", () => {
  it("gives admin its own colour", () => {
    expect(roleBadgeClass("admin")).toBe("bg-red-500");
    expect(roleBadgeClass("dev")).toBe("bg-blue-500");
    expect(roleBadgeClass("non-dev")).toBe("bg-pink-500");
  });
});
