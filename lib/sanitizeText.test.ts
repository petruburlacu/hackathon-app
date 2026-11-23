import { describe, expect, it } from "vitest";
import { sanitizeMultilineText } from "./sanitizeText";

describe("sanitizeMultilineText", () => {
  it("keeps line breaks and collapses runs of blank lines", () => {
    expect(
      sanitizeMultilineText(
        "Line one\r\n\r\n\r\n\r\nLine two\nLine three",
        500,
      ),
    ).toBe("Line one\n\nLine two\nLine three");
  });

  it("strips control and zero-width characters and trims each line", () => {
    expect(
      sanitizeMultilineText("  Hi\u200B there\u0007  \n\t next  ", 500),
    ).toBe("Hi there\nnext");
  });

  it("caps the length", () => {
    expect(sanitizeMultilineText("abcdef", 3)).toBe("abc");
  });
});
