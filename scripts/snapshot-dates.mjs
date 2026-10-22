// Saves every published post's Notion id and dates, as the live site has them,
// to src/lib/notion/moved-posts.json. Run it right before copying the blog to
// another Notion workspace: the copies come back with new ids and today's
// dates, and this file is what lets the site keep the old ones.
//
//   npm run snapshot-dates                          # https://notion.santimh.dev
//   npm run snapshot-dates -- http://localhost:3000
import { writeFile } from "node:fs/promises";

const site = process.argv[2] ?? "https://notion.santimh.dev";
const out = new URL("../src/lib/notion/moved-posts.json", import.meta.url);

const response = await fetch(new URL("/feed.json", site));
if (!response.ok) {
  throw new Error(`GET ${response.url} answered ${response.status}`);
}
const feed = await response.json();

const posts = {};
for (const item of feed.items) {
  const slug = new URL(item.url).pathname.replace(/^\/posts\//, "");
  posts[slug] = {
    id: item.id,
    published: item.date_published,
    updated: item.date_modified,
  };
}

await writeFile(out, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Saved ${Object.keys(posts).length} posts to src/lib/notion/moved-posts.json`);
