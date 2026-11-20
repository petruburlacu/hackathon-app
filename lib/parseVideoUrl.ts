export type ParsedVideo =
  | { kind: "embed"; provider: "youtube" | "loom" | "vimeo"; src: string }
  | { kind: "link"; provider: "sharepoint"; href: string };

const ID = /^[A-Za-z0-9_-]+$/;
const NUMERIC_ID = /^\d+$/;

function isHost(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function youtubeId(url: URL): string | null {
  const [first, second] = url.pathname.split("/").filter(Boolean);
  if (isHost(url.hostname, "youtu.be")) return first ?? null;
  if (first === "watch") return url.searchParams.get("v");
  if (first === "embed" || first === "shorts" || first === "live") {
    return second ?? null;
  }
  return null;
}

// Stored content is untrusted: the editor and the reader rebuild every iframe src and link href from this,
// never from the stored URL, so only the listed hosts can ever render.
export function parseVideoUrl(input: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname;
  const segments = url.pathname.split("/").filter(Boolean);

  if (isHost(host, "youtube.com") || isHost(host, "youtu.be")) {
    const id = youtubeId(url);
    return id && ID.test(id)
      ? {
          kind: "embed",
          provider: "youtube",
          src: `https://www.youtube-nocookie.com/embed/${id}`,
        }
      : null;
  }

  if (isHost(host, "loom.com")) {
    const [kind, id] = segments;
    return (kind === "share" || kind === "embed") && id && ID.test(id)
      ? {
          kind: "embed",
          provider: "loom",
          src: `https://www.loom.com/embed/${id}`,
        }
      : null;
  }

  if (isHost(host, "vimeo.com")) {
    const [id, hash] =
      host === "player.vimeo.com" && segments[0] === "video"
        ? [segments[1], url.searchParams.get("h")]
        : segments;
    if (!id || !NUMERIC_ID.test(id)) return null;
    const src = `https://player.vimeo.com/video/${id}`;
    return {
      kind: "embed",
      provider: "vimeo",
      src: hash && ID.test(hash) ? `${src}?h=${hash}` : src,
    };
  }

  // Bare sharepoint.com is not a tenant; every Opus 2 site is a subdomain.
  if (host.endsWith(".sharepoint.com") || host === "stream.office.com") {
    // Cards are plain links, so insist on TLS and drop any user:password@ part.
    if (url.protocol !== "https:") return null;
    return {
      kind: "link",
      provider: "sharepoint",
      href: `https://${url.host}${url.pathname}${url.search}`,
    };
  }

  return null;
}
