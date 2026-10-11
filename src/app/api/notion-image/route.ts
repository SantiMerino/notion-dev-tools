import {
  isFullBlock,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client";
import type { NextRequest } from "next/server";

import { blogPageId, notion } from "@/lib/notion/client";
import { isDraft } from "@/lib/notion/posts";

const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

type FileValue = { type?: string; file?: { url: string } };

/** Pull the signed URL out of any Notion file-bearing block, or a callout's uploaded icon. */
function urlFromBlock(block: unknown): string | null {
  const body = block as Record<string, FileValue & { icon?: FileValue | null }>;
  for (const key of ["image", "video", "file", "pdf"] as const) {
    const value = body[key];
    if (value?.type === "file" && value.file) return value.file.url;
  }
  const icon = body.callout?.icon;
  if (icon?.type === "file" && icon.file) return icon.file.url;
  return null;
}

const bare = (id: string) => id.replace(/-/g, "").toLowerCase();

/**
 * Only published posts' covers and icons go out: the integration can read
 * drafts under "web-blog" too, and an id is all a request needs.
 */
function isPublishedPost(page: PageObjectResponse): boolean {
  if (page.parent.type !== "page_id") return false;
  if (bare(page.parent.page_id) !== bare(blogPageId())) return false;
  const title = Object.values(page.properties).find(
    (property) => property.type === "title",
  );
  const text =
    title?.type === "title" ? title.title.map((t) => t.plain_text).join("") : "";
  return !isDraft(text);
}

/**
 * Notion serves uploaded files from pre-signed URLs that expire after about an
 * hour, so they can't be embedded in cached HTML. Pages link here instead and
 * this route resolves a fresh URL on demand.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") ?? "block";

  if (!id || !UUID.test(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  try {
    let url: string | null = null;

    if (type === "cover" || type === "icon") {
      const page = await notion.pages.retrieve({ page_id: id });
      if (isFullPage(page) && isPublishedPost(page)) {
        const asset = type === "cover" ? page.cover : page.icon;
        if (asset?.type === "file") url = asset.file.url;
      }
    } else {
      const block = await notion.blocks.retrieve({ block_id: id });
      if (isFullBlock(block)) url = urlFromBlock(block);
    }

    if (!url) return new Response("Not found", { status: 404 });

    return new Response(null, {
      status: 307,
      headers: {
        Location: url,
        // Comfortably inside Notion's signed-URL lifetime.
        "Cache-Control": "public, max-age=0, s-maxage=1800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
