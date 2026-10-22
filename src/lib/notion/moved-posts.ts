import snapshot from "./moved-posts.json";

/**
 * Notion can't move a page to another workspace, only copy it there, and the
 * copy gets a new id and fresh `created_time` / `last_edited_time`. Left
 * alone, every moved post would read as published on moving day, the index
 * would re-sort into copy order, and feed readers would see each post as new.
 *
 * `moved-posts.json` keeps what each post had before the move, keyed by slug.
 * `npm run snapshot-dates` writes it from the live feed; run it right before
 * moving (README, "Moving to another Notion workspace"). Posts it doesn't list
 * use Notion's own timestamps.
 */
type Original = { id: string; published: string; updated: string };

const originals: Record<string, Original> = snapshot;

/**
 * A copy starts with `last_edited_time` next to its `created_time`. An edit
 * later than this after the copy was made is a real update; anything sooner
 * is the move itself.
 */
const SETTLE_MS = 10 * 60 * 1000;

type Timestamps = { created_time: string; last_edited_time: string };

/** A post's publish and last-edit dates, from before the move when known. */
export function postDates(
  slug: string,
  page: Timestamps,
): { createdAt: string; updatedAt: string } {
  const original = originals[slug];
  if (!original) {
    return { createdAt: page.created_time, updatedAt: page.last_edited_time };
  }
  const editedSince =
    Date.parse(page.last_edited_time) - Date.parse(page.created_time) > SETTLE_MS;
  return {
    createdAt: original.published,
    updatedAt: editedSince ? page.last_edited_time : original.updated,
  };
}

/** The Notion id a post had before the move, if it moved. */
export function originalId(slug: string): string | undefined {
  return originals[slug]?.id;
}
