import { absolute, FEED_CACHE_CONTROL, feedTitle } from "@/lib/feed";
import { getPosts } from "@/lib/notion/posts";
import { site } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Every published post as RSS 2.0, for feed readers. */
export async function GET() {
  const posts = await getPosts();
  const newest = posts[0]?.updatedAt;

  const items = posts
    .map((post) => {
      const url = absolute(`/posts/${post.slug}`);
      return [
        "    <item>",
        `      <title>${escapeXml(feedTitle(post))}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="false">${post.id}</guid>`,
        `      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>`,
        post.excerpt
          ? `      <description>${escapeXml(post.excerpt)}</description>`
          : null,
        post.series
          ? `      <category>${escapeXml(post.series.seriesTitle)}</category>`
          : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.title} — ${site.name}`)}</title>
    <link>${escapeXml(absolute("/"))}</link>
    <description>${escapeXml(site.description)}</description>
    <language>es</language>
    <atom:link href="${escapeXml(absolute("/feed.xml"))}" rel="self" type="application/rss+xml" />${
      newest ? `\n    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>` : ""
    }
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": FEED_CACHE_CONTROL,
    },
  });
}
