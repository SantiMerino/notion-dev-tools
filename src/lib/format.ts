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
