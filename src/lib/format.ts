const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Format an ISO timestamp from Notion. Pinned to UTC so the server render and
 * the client hydration can't disagree about the day.
 */
export function formatDate(iso: string): string {
  return formatter.format(new Date(iso));
}

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Compact variant for the post index, where the date sits in a narrow column
 * beside the title. Same UTC pinning as `formatDate`.
 */
export function formatShortDate(iso: string): string {
  return shortFormatter.format(new Date(iso));
}
