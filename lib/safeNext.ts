const DEFAULT_PATH = "/hackathon";
const BASE = "http://local.invalid";

// `next` comes from the URL, so only same-origin pages under /hackathon are honoured (no open redirect).
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/")) return DEFAULT_PATH;
  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return DEFAULT_PATH;
  }
  if (url.origin !== BASE || !/^\/hackathon(\/|$)/.test(url.pathname)) {
    return DEFAULT_PATH;
  }
  return url.pathname + url.search + url.hash;
}
