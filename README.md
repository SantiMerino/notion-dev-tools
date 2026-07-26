# notion-blog

A blog you write in Notion. Posts are subpages of a Notion page called
**web-blog**; this Next.js app reads them through the Notion API and renders
them as a static site.

## How it works

```
Notion "web-blog" page
  ├── "first post"        ──▶  Notion REST API  ──▶  Next.js  ──▶  /posts/first-post
  └── "_scratch"  (hidden)
```

- `src/lib/notion/posts.ts` lists the child pages of **web-blog** and turns each
  one into a `Post`.
- `src/lib/notion/blocks.ts` walks a post's block tree recursively.
- `src/components/notion/blocks.tsx` maps each Notion block type to JSX.

Content is cached with Next.js [Cache Components](https://nextjs.org/docs/app/getting-started/caching)
(`use cache` + `cacheLife("hours")`), so visitors are served a static shell and
Notion is hit at most once an hour — or immediately after you call the
revalidate endpoint.

## Setup

1. Create an internal integration at
   <https://www.notion.so/profile/integrations> and copy its token.

2. Put the token in `.env.local`:

   ```
   NOTION_TOKEN=ntn_...
   ```

   `NOTION_BLOG_PAGE_ID` and `REVALIDATE_SECRET` are already filled in.

3. **Share the page with the integration.** This is the step everyone misses —
   without it the API returns 404 even though the token is valid. Open the
   **web-blog** page in Notion → `···` menu → **Connections** → **Add
   connections** → pick your integration. Subpages inherit the access.

4. Run it:

   ```bash
   npm run dev
   ```

## Writing posts

Create a subpage under **web-blog**. The page title becomes the post title and
its slug (`My First Post` → `/posts/my-first-post`). Page icon and cover show up
on the post card.

To hide a work-in-progress, start the title with `_` or `[draft]`.

## Refreshing after an edit

Cached content refreshes on its own within the hour. To push an edit live
immediately:

```bash
curl -X POST http://localhost:3000/api/revalidate -H "x-revalidate-secret: YOUR_SECRET"
```

In production you can point a
[Notion webhook](https://developers.notion.com/reference/webhooks) at that URL
so publishing in Notion updates the site right away.

## Supported blocks

Paragraphs, headings 1–3, bulleted / numbered / to-do lists (nested), quotes,
callouts, code, dividers, images, video, bookmarks, embeds, toggles, columns,
tables, and equations. Unsupported blocks are skipped rather than crashing the
page.

## Notes

- **Images.** Notion serves uploaded files from pre-signed URLs that expire in
  about an hour, so they can't be baked into cached HTML. Images point at
  `/api/notion-image` instead, which resolves a fresh URL per request.
- **Nested pages.** A subpage inside a post is treated as a leaf, not inlined.
- **OneDrive.** This project lives in a synced folder. If you hit file-lock or
  `EPERM` errors during `npm install`, exclude `node_modules` in OneDrive
  settings (Settings → Sync and backup → Advanced) or move the project to a
  non-synced path like `C:\dev\`.

## Deploying

Push to GitHub, import on Vercel, and set `NOTION_TOKEN`,
`NOTION_BLOG_PAGE_ID`, and `REVALIDATE_SECRET` as environment variables. The
build calls Notion to prerender every post, so the token must be present at
build time.
