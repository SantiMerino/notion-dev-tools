// Every formatter is pinned to UTC so the server render and the client
// hydration can't disagree about the day.

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "August 18, 2026": the full date, for a post's header and the lead card. */
export function formatDate(iso: string): string {
  return formatter.format(new Date(iso));
}

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** "Aug 18, 2026": for a narrow date column beside a title. */
export function formatShortDate(iso: string): string {
  return shortFormatter.format(new Date(iso));
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "August 2026": the label over a month's posts on the index rail. */
export function formatMonth(iso: string): string {
  return monthFormatter.format(new Date(iso));
}

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  timeZone: "UTC",
});

/** "07": a post's day on the rail, under its month's label. */
export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/** "UTC year-month", for grouping posts by the month they went out. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
