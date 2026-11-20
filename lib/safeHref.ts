const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeHref(href: unknown): href is string {
  if (typeof href !== "string") return false;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(href.trim()).protocol);
  } catch {
    return false;
  }
}

// A colon followed by digits is a port ("localhost:3000"), not a scheme.
// Turns what a person types ("example.com", " https://x.y ") into a safe absolute link, or null.
export function normaliseHref(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return isSafeHref(withScheme) ? withScheme : null;
}
