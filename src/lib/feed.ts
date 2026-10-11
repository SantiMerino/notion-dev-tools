import type { Post } from "@/lib/notion/posts";
import { site } from "@/lib/site";

/** Absolute URL on this site: feeds are read off-site, where a path means nothing. */
export function absolute(path: string): string {
  return new URL(path, site.url).toString();
}

/** A post's full title, with its series in front when it has one. */
export function feedTitle(post: Post): string {
  return post.series
    ? `${post.series.seriesTitle}: ${post.series.displayTitle}`
    : post.title;
}

/** How long a feed reader (or the portfolio) may hold a copy before asking again. */
export const FEED_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
