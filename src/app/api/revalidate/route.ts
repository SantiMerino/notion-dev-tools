import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { POSTS_TAG } from "@/lib/notion/posts";

function secretMatches(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Drops the cached Notion content so the next visitor sees the latest edits.
 * Call it after publishing, or wire it to a Notion webhook.
 *
 *   curl -X POST https://your-site/api/revalidate -H "x-revalidate-secret: ..."
 */
export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get("x-revalidate-secret"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // `{ expire: 0 }`, not "max". Under "max" the tag is only marked stale, so
  // the first visitor after publishing is still served the previous version
  // and merely triggers the refetch in the background — the edit shows up on
  // the *second* view. Expiring outright costs that one visitor a blocking
  // fetch and makes the publish visible immediately, which is the whole point
  // of calling this endpoint. Next's docs name this the webhook case.
  revalidateTag(POSTS_TAG, { expire: 0 });

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
