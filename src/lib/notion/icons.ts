import type { PageObjectResponse } from "@notionhq/client";

/**
 * A Notion icon (a page's or a callout's), normalized for rendering: either a
 * Unicode emoji or an image URL (already a stable link or a proxy path, never
 * a raw signed one).
 */
export type NotionIcon =
  | { kind: "emoji"; emoji: string }
  | { kind: "image"; url: string };

/** Pages and callouts share one icon shape in the API. */
type IconResponse = PageObjectResponse["icon"];

/**
 * Notion has five icon types: a Unicode `emoji`; a workspace `custom_emoji`
 * and an `external` link, both on stable URLs usable as-is; an uploaded
 * `file`, whose URL is pre-signed and expires in about an hour, so it goes
 * through `proxyUrl` (see /api/notion-image) like covers do; and the built-in
 * `icon` gallery, which we don't render.
 */
export function iconOf(icon: IconResponse, proxyUrl: string): NotionIcon | null {
  if (!icon) return null;
  switch (icon.type) {
    case "emoji":
      return { kind: "emoji", emoji: icon.emoji };
    case "custom_emoji":
      return { kind: "image", url: icon.custom_emoji.url };
    case "external":
      return { kind: "image", url: icon.external.url };
    case "file":
      return { kind: "image", url: proxyUrl };
    default:
      return null;
  }
}
