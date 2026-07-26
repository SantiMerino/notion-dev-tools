import { isFullBlock, isFullPage } from "@notionhq/client";
import type { NextRequest } from "next/server";

import { notion } from "@/lib/notion/client";

const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/** Pull the signed URL out of any Notion file-bearing block. */
function urlFromBlock(block: unknown): string | null {
  const body = block as Record<string, { type?: string; file?: { url: string } }>;
  for (const key of ["image", "video", "file", "pdf"] as const) {
    const value = body[key];
    if (value?.type === "file" && value.file) return value.file.url;
  }
  return null;
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

    if (type === "cover") {
      const page = await notion.pages.retrieve({ page_id: id });
      if (isFullPage(page) && page.cover?.type === "file") {
        url = page.cover.file.url;
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
