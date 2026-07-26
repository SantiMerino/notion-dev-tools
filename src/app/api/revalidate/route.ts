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

  // "max" serves the stale page while the fresh one renders in the background.
  revalidateTag(POSTS_TAG, "max");

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
