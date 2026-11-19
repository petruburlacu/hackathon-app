export const EVENT_NAME = "Hackathon 2026";
export const EVENT_START = new Date("2026-12-02T10:00:00Z");

export const EVENT_START_LABEL = `${new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
}).format(EVENT_START)} UTC`;
