import { absolute, FEED_CACHE_CONTROL, feedTitle } from "@/lib/feed";
import { getPosts } from "@/lib/notion/posts";
import { site } from "@/lib/site";

/**
 * Every published post as a JSON Feed 1.1 (https://jsonfeed.org/version/1.1).
 *
 * santimh.dev's Writing section is built from this (santimh/server/writing.ts):
 * it reads each item's `url`, `title`, `summary`, `date_published` and
 * `_series`, so keep those stable. `_series` carries a series post's name,
 * part and total apart from its title.
 */
export async function GET() {
  const posts = await getPosts();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${site.title} — ${site.name}`,
    description: site.description,
    home_page_url: absolute("/"),
    feed_url: absolute("/feed.json"),
    language: "es",
    authors: [{ name: site.name, url: site.portfolioUrl }],
    items: posts.map((post) => ({
      id: post.id,
      url: absolute(`/posts/${post.slug}`),
      title: feedTitle(post),
      summary: post.excerpt || undefined,
      image: post.coverUrl ? absolute(post.coverUrl) : undefined,
      date_published: post.createdAt,
      date_modified: post.updatedAt,
      _series: post.series
        ? {
            title: post.series.seriesTitle,
            part_title: post.series.displayTitle,
            part: post.series.part,
            total: post.series.total,
          }
        : undefined,
    })),
  };

  return Response.json(feed, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": FEED_CACHE_CONTROL,
    },
  });
}
