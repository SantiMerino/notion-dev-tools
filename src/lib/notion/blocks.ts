import {
  collectPaginatedAPI,
  isFullBlock,
  type BlockObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import { notion } from "./client";

/** A block plus its recursively resolved children. */
export type BlockNode = BlockObjectResponse & { children: BlockNode[] };

/** Notion nests indefinitely; this caps runaway recursion on pathological pages. */
const MAX_DEPTH = 5;

/**
 * Fetch a block's children as a tree. `child_page` blocks are treated as
 * leaves — a nested page is its own post, not part of this one's body.
 */
export async function fetchBlockTree(
  blockId: string,
  depth = 0,
): Promise<BlockNode[]> {
  if (depth >= MAX_DEPTH) return [];

  const blocks = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  });

  return Promise.all(
    blocks.filter(isFullBlock).map(async (block) => ({
      ...block,
      children:
        block.has_children && block.type !== "child_page"
          ? await fetchBlockTree(block.id, depth + 1)
          : [],
    })),
  );
}

/** Flatten Notion rich text to a plain string. */
export function plainText(richText: RichTextItemResponse[]): string {
  return richText.map((item) => item.plain_text).join("");
}

/**
 * Read the rich text out of any block type that carries some. Notion keys it
 * under the block's own type, so this avoids a switch over every variant.
 */
export function blockRichText(
  block: BlockObjectResponse,
): RichTextItemResponse[] {
  const body = (block as Record<string, unknown>)[block.type];
  if (body && typeof body === "object" && "rich_text" in body) {
    const richText = (body as { rich_text: unknown }).rich_text;
    if (Array.isArray(richText)) return richText as RichTextItemResponse[];
  }
  return [];
}
