import { cacheLife, cacheTag } from "next/cache";
import {
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
  type PageObjectResponse,
} from "@notionhq/client";

import { blogPageId, notion } from "./client";
import { blockRichText, fetchBlockTree, plainText, type BlockNode } from "./blocks";
import { slugify, uniqueSlug } from "./slug";

/** Cache tag invalidated by POST /api/revalidate. */
export const POSTS_TAG = "notion-posts";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  emoji: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostWithContent = Post & { blocks: BlockNode[] };

/**
 * A post is hidden while its title starts with `_` or `[draft]`, so you can
 * work on it inside "web-blog" without publishing it.
 */
function isDraft(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.startsWith("_") || /^\[draft\]/i.test(trimmed);
}

/** First non-empty line of body text, used as the card preview. */
function buildExcerpt(blocks: BlockNode[]): string {
  for (const block of blocks) {
    if (block.type === "child_page") continue;
    const text = plainText(blockRichText(block)).trim();
    if (text) return text.length > 200 ? `${text.slice(0, 197)}...` : text;
  }
  return "";
}

function emojiOf(page: PageObjectResponse): string | null {
  return page.icon?.type === "emoji" ? page.icon.emoji : null;
}

/**
 * Notion's own file URLs are pre-signed and expire in about an hour, so they
 * must never be baked into cached HTML. We store a stable proxy URL instead
 * and resolve the real one per request. External URLs are safe to use as-is.
 */
function coverUrlOf(page: PageObjectResponse): string | null {
  if (!page.cover) return null;
  if (page.cover.type === "external") return page.cover.external.url;
  return `/api/notion-image?type=cover&id=${page.id}`;
}

/**
 * Every published post under the "web-blog" page, newest first.
 */
export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(POSTS_TAG);

  const children = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blogPageId(),
  });

  const pages = children
    .filter(isFullBlock)
    .filter((block) => block.type === "child_page")
    .filter((block) => !isDraft(block.child_page.title))
    // Oldest first so slug collisions suffix the newer post, keeping
    // already-published URLs stable.
    .sort((a, b) => a.created_time.localeCompare(b.created_time));

  const taken = new Set<string>();
  const slugs = pages.map((block) =>
    uniqueSlug(slugify(block.child_page.title), block.id, taken),
  );

  const posts = await Promise.all(
    pages.map(async (block, index): Promise<Post> => {
      const [page, preview] = await Promise.all([
        notion.pages.retrieve({ page_id: block.id }),
        // Only the first few blocks are needed to build an excerpt.
        notion.blocks.children.list({ block_id: block.id, page_size: 10 }),
      ]);

      return {
        id: block.id,
        slug: slugs[index],
        title: block.child_page.title,
        excerpt: buildExcerpt(
          preview.results.filter(isFullBlock).map((b) => ({
            ...b,
            children: [],
          })),
        ),
        emoji: isFullPage(page) ? emojiOf(page) : null,
        coverUrl: isFullPage(page) ? coverUrlOf(page) : null,
        createdAt: block.created_time,
        updatedAt: block.last_edited_time,
      };
    }),
  );

  return posts.reverse();
}

/** A single post with its full block tree, or null if the slug is unknown. */
export async function getPost(slug: string): Promise<PostWithContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(POSTS_TAG);

  const post = (await getPosts()).find((candidate) => candidate.slug === slug);
  if (!post) return null;

  return { ...post, blocks: await fetchBlockTree(post.id) };
}
