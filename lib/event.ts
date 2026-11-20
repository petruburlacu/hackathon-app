export const EVENT_NAME = "Hackathon 2026";
export const EVENT_START = new Date("2026-12-02T10:00:00Z");

export const EVENT_START_LABEL = `${new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
}).format(EVENT_START)} UTC`;

export const DEFAULT_SUBMISSIONS_CLOSE = new Date("2026-12-03T17:00:00Z");
export const DEFAULT_VOTING_CLOSE = new Date("2026-12-06T23:59:00Z");
