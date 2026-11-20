import { describe, expect, it } from "vitest";
import { parseVideoUrl } from "./parseVideoUrl";

describe("parseVideoUrl", () => {
  it.each([
    "https://youtu.be/abc",
    "https://www.youtube.com/watch?v=abc",
    "https://youtube.com/watch?v=abc&t=30s",
    "https://m.youtube.com/watch?v=abc",
    "https://www.youtube.com/shorts/abc",
    "https://www.youtube.com/embed/abc",
    " https://youtu.be/abc?si=xyz ",
  ])("embeds YouTube %j through youtube-nocookie", (url) => {
    expect(parseVideoUrl(url)).toEqual({
      kind: "embed",
      provider: "youtube",
      src: "https://www.youtube-nocookie.com/embed/abc",
    });
  });

  it.each(["https://www.loom.com/share/xyz", "https://loom.com/embed/xyz"])(
    "embeds Loom %j",
    (url) => {
      expect(parseVideoUrl(url)).toEqual({
        kind: "embed",
        provider: "loom",
        src: "https://www.loom.com/embed/xyz",
      });
    },
  );

  it.each(["https://vimeo.com/123", "https://player.vimeo.com/video/123"])(
    "embeds Vimeo %j",
    (url) => {
      expect(parseVideoUrl(url)).toEqual({
        kind: "embed",
        provider: "vimeo",
        src: "https://player.vimeo.com/video/123",
      });
    },
  );

  it("keeps the privacy hash of an unlisted Vimeo video", () => {
    expect(parseVideoUrl("https://vimeo.com/123/abc456")).toEqual({
      kind: "embed",
      provider: "vimeo",
      src: "https://player.vimeo.com/video/123?h=abc456",
    });
  });

  it.each([
    "https://opus2.sharepoint.com/:v:/s/team/EabcDEF?e=x1",
    "https://opus2-my.sharepoint.com/personal/a_b/_layouts/15/stream.aspx?id=1",
    "https://stream.office.com/video/abc",
  ])("turns %j into a link card", (url) => {
    expect(parseVideoUrl(url)).toEqual({
      kind: "link",
      provider: "sharepoint",
      href: url,
    });
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)//https://youtu.be/abc",
    "data:text/html,<script>alert(1)</script>",
    "https://evil.com/youtube.com",
    "http://youtube.com.evil.io/x",
    "https://evilyoutube.com/watch?v=abc",
    "https://youtube.com@evil.com/watch?v=abc",
    "https://evil.com/?u=https://youtu.be/abc",
    "https://sharepoint.com/x",
    "https://opus2.sharepoint.com.evil.io/:v:/x",
    "http://opus2.sharepoint.com/:v:/x",
    "https://evilstream.office.com/x",
    "https://office.com/x",
    "ftp://youtu.be/abc",
    "https://www.youtube.com/channel/abc",
    "https://www.youtube.com/watch?v=a%22b",
    "https://youtu.be/",
    "https://vimeo.com/abc",
    'https://www.loom.com/share/x"onload=alert(1)',
    "youtu.be/abc",
    "",
    "not a url",
  ])("rejects %j (review focus #5)", (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe("sharepoint card hygiene", () => {
  it("drops credentials from card links", () => {
    expect(parseVideoUrl("https://user:pw@opus2.sharepoint.com/:v:/s/t/E?e=1")).toEqual({
      kind: "link",
      provider: "sharepoint",
      href: "https://opus2.sharepoint.com/:v:/s/t/E?e=1",
    });
  });
});
