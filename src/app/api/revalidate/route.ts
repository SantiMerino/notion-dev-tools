import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { POSTS_TAG } from "@/lib/notion/posts";

/**
 * How the site stays in sync with Notion:
 *
 *  1. Notion webhook  → this route, signature-verified, on every page change.
 *     This is the path that makes edits and deletes appear immediately.
 *  2. Manual trigger  → `curl -H "x-revalidate-secret: ..."`, for local dev
 *     and one-off pushes.
 *  3. Fingerprint timer in `lib/notion/posts.ts`, a ~60s backstop for a
 *     webhook delivery that never arrives.
 *
 * See README "Refreshing after an edit" for the one-time webhook setup.
 */

function bytesEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Manual / legacy trigger: a shared secret in `x-revalidate-secret`. */
function manualSecretMatches(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  return Boolean(expected && provided && bytesEqual(provided, expected));
}

/**
 * Notion signs every event with HMAC-SHA256 over the *raw* request body, keyed
 * by the `verification_token` from the subscription handshake (stored as
 * NOTION_WEBHOOK_SECRET). The body has to be hashed exactly as it arrived —
 * re-serializing the parsed JSON produces different bytes and fails the check.
 */
function notionSignatureValid(rawBody: string, header: string | null): boolean {
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  return bytesEqual(header, expected);
}

/**
 * Any structural or content change to a page under "web-blog". The integration
 * only has access to that page's subtree, so Notion never sends us events for
 * unrelated pages — no need to check the parent. Lock state doesn't alter
 * rendered output, so it's the one page event we skip.
 */
function affectsBlog(eventType: string): boolean {
  return (
    eventType.startsWith("page.") &&
    eventType !== "page.locked" &&
    eventType !== "page.unlocked"
  );
}

function expirePostsCache(): void {
  // `{ expire: 0 }`, not the default. Under a plain revalidate the tag is only
  // marked stale, so the first visitor after a change is still served the old
  // version and merely triggers the refetch in the background — the change
  // shows up on the *second* view. Expiring outright costs that one visitor a
  // blocking fetch and makes the change visible on the very next hit, which is
  // the whole point of an on-demand call. Next's docs name this the webhook
  // case.
  revalidateTag(POSTS_TAG, { expire: 0 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    // Non-JSON body — falls through to the manual-secret check below.
  }
  const body = (parsed ?? {}) as Record<string, unknown>;

  // 1. Subscription handshake. Notion's first POST to a new subscription
  //    carries only a verification token and no signature. Echo it back and
  //    log it so it can be pasted into the Notion UI *and* set as
  //    NOTION_WEBHOOK_SECRET. There's nothing to authenticate against yet.
  if (typeof body.verification_token === "string") {
    console.log(
      `[revalidate] Notion webhook verification_token: ${body.verification_token}`,
    );
    return Response.json({ verification_token: body.verification_token });
  }

  // 2. Signed Notion event.
  const signature = request.headers.get("x-notion-signature");
  if (signature) {
    if (!process.env.NOTION_WEBHOOK_SECRET) {
      console.warn(
        "[revalidate] received a signed Notion event but NOTION_WEBHOOK_SECRET is unset — set it to the verification_token from the handshake",
      );
    }
    if (!notionSignatureValid(rawBody, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = typeof body.type === "string" ? body.type : "";
    if (affectsBlog(eventType)) {
      expirePostsCache();
      return Response.json({
        revalidated: true,
        event: eventType,
        at: new Date().toISOString(),
      });
    }
    // Ack unrelated events (comments, schema changes, lock toggles) so Notion
    // treats them as delivered and doesn't retry.
    return Response.json({ revalidated: false, event: eventType });
  }

  // 3. Manual trigger.
  if (manualSecretMatches(request.headers.get("x-revalidate-secret"))) {
    expirePostsCache();
    return Response.json({ revalidated: true, at: new Date().toISOString() });
  }

  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
