import { describe, expect, it } from "vitest";
import { fitWithin } from "./compressImage";

describe("fitWithin", () => {
  it("scales a landscape image so the long edge is the limit", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait image by its height", () => {
    expect(fitWithin(1080, 2400, 1600)).toEqual({ width: 720, height: 1600 });
  });

  it("leaves a small image alone", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("keeps a very thin image at least 1 px wide", () => {
    expect(fitWithin(10, 20000, 1600)).toEqual({ width: 1, height: 1600 });
  });
});
