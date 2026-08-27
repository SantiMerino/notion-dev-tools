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

/** A post's place in a multi-part series, e.g. "Canvas + Notion parte 2: ...". */
export type SeriesInfo = {
  seriesTitle: string;
  displayTitle: string;
  part: number;
  total: number;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  emoji: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  series: SeriesInfo | null;
};

/** A post's siblings within its series, in part order. */
export type SeriesLink = { slug: string; title: string; part: number };

const SERIES_TITLE_PATTERN = /^(.*?)\s+parte\s+(\d+)\s*:\s*(.+)$/i;

/**
 * Splits a title like "Canvas + Notion parte 2: features avanzados" into its
 * series name, part number, and the part-specific display title. Posts whose
 * title doesn't match aren't part of a series.
 */
function parseSeriesTitle(
  title: string,
): { seriesTitle: string; displayTitle: string; part: number } | null {
  const match = title.match(SERIES_TITLE_PATTERN);
  if (!match) return null;
  return {
    seriesTitle: match[1].trim(),
    part: Number(match[2]),
    displayTitle: match[3].trim(),
  };
}

export type PostWithContent = Post & { blocks: BlockNode[] };

/** A post plus a flattened copy of its body, for client-side search. */
export type SearchablePost = Post & { searchText: string };

/** Caps how much body text per post is shipped to the browser for searching. */
const SEARCH_TEXT_LIMIT = 4000;

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
 * A cheap string that changes whenever any post does.
 *
 * Listing the blog page's children is a single request that carries every
 * child's `last_edited_time`, and Notion keeps that timestamp in step with the
 * page's own — editing a post's body bumps it, not just renaming the page. So
 * one small call is enough to tell whether a full refetch is warranted.
 *
 * This is the only function on a short cache life. Everything expensive below
 * takes the fingerprint as an argument, which makes it part of that function's
 * cache key: same fingerprint means the cached result stands, and a changed one
 * misses into a fresh fetch. The result is a ~60s ceiling on staleness that
 * costs one request per minute instead of re-reading the whole blog on a timer.
 */
async function contentFingerprint(): Promise<string> {
  "use cache";
  // `stale: 0` keeps the client router from holding its own copy for the
  // default 5 minutes, which would mask a fresh server render on navigation.
  cacheLife({ stale: 0, revalidate: 60, expire: 300 });
  cacheTag(POSTS_TAG);

  const children = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: blogPageId(),
  });

  return children
    .filter(isFullBlock)
    .filter((block) => block.type === "child_page")
    .map((block) => `${block.id}:${block.last_edited_time}`)
    .sort()
    .join("|");
}

/**
 * Every published post under the "web-blog" page, newest first.
 */
export async function getPosts(): Promise<Post[]> {
  return postsFor(await contentFingerprint());
}

/** `fingerprint` is unread on purpose — it exists to key the cache entry. */
async function postsFor(fingerprint: string): Promise<Post[]> {
  "use cache";
  cacheLife("days");
  cacheTag(POSTS_TAG);
  void fingerprint;

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

  // A title only counts as a series once a second post shares its series
  // name — one post matching the "parte N:" pattern on its own isn't a series.
  const seriesCounts = new Map<string, number>();
  for (const block of pages) {
    const parsed = parseSeriesTitle(block.child_page.title);
    if (!parsed) continue;
    seriesCounts.set(
      parsed.seriesTitle,
      (seriesCounts.get(parsed.seriesTitle) ?? 0) + 1,
    );
  }

  const posts = await Promise.all(
    pages.map(async (block, index): Promise<Post> => {
      const [page, preview] = await Promise.all([
        notion.pages.retrieve({ page_id: block.id }),
        // Only the first few blocks are needed to build an excerpt.
        notion.blocks.children.list({ block_id: block.id, page_size: 10 }),
      ]);

      const parsed = parseSeriesTitle(block.child_page.title);
      const total = parsed ? (seriesCounts.get(parsed.seriesTitle) ?? 0) : 0;

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
        series:
          parsed && total > 1
            ? { ...parsed, total }
            : null,
      };
    }),
  );

  return posts.reverse();
}

/** Every other post in the same series as `post`, in part order. */
export async function getSeriesLinks(post: Post): Promise<SeriesLink[]> {
  if (!post.series) return [];

  const posts = await getPosts();
  return posts
    .filter((candidate) => candidate.series?.seriesTitle === post.series?.seriesTitle)
    .map((candidate) => ({
      slug: candidate.slug,
      title: candidate.series!.displayTitle,
      part: candidate.series!.part,
    }))
    .sort((a, b) => a.part - b.part);
}

/** Flatten a block tree to one searchable string, including nested children. */
function blocksToText(blocks: BlockNode[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === "table_row") {
      parts.push(block.table_row.cells.map(plainText).join(" "));
    } else {
      const text = plainText(blockRichText(block));
      if (text) parts.push(text);
    }
    if (block.children.length > 0) parts.push(blocksToText(block.children));
  }

  return parts.join("\n");
}

/**
 * Posts with their body text attached, for the search box on the home page.
 * Reuses the per-slug `getPost` cache entries rather than refetching.
 */
export async function getSearchablePosts(): Promise<SearchablePost[]> {
  return searchablePostsFor(await contentFingerprint());
}

async function searchablePostsFor(
  fingerprint: string,
): Promise<SearchablePost[]> {
  "use cache";
  cacheLife("days");
  cacheTag(POSTS_TAG);

  // Threading the fingerprint through rather than calling the public wrappers
  // keeps this to one probe for the whole page instead of one per post.
  const posts = await postsFor(fingerprint);

  return Promise.all(
    posts.map(async (post) => {
      const full = await postFor(fingerprint, post.slug);
      return {
        ...post,
        searchText: full
          ? blocksToText(full.blocks).slice(0, SEARCH_TEXT_LIMIT)
          : "",
      };
    }),
  );
}

/** A single post with its full block tree, or null if the slug is unknown. */
export async function getPost(slug: string): Promise<PostWithContent | null> {
  return postFor(await contentFingerprint(), slug);
}

async function postFor(
  fingerprint: string,
  slug: string,
): Promise<PostWithContent | null> {
  "use cache";
  cacheLife("days");
  cacheTag(POSTS_TAG);

  const post = (await postsFor(fingerprint)).find(
    (candidate) => candidate.slug === slug,
  );
  if (!post) return null;

  return { ...post, blocks: await fetchBlockTree(post.id) };
}
