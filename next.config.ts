import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt into the Cache Components model so `use cache` / `cacheLife` /
  // `cacheTag` are available. Notion content is cached and served from the
  // static shell, then refreshed by the Notion webhook (POST /api/revalidate)
  // or, as a backstop, on the fingerprint timer in `lib/notion/posts.ts`.
  cacheComponents: true,

  cacheLife: {
    // Profile for the post caches, which are keyed by a cheap change
    // fingerprint (see `lib/notion/posts.ts`). A long server-side life is safe
    // precisely because that key rotates the moment content changes, so a
    // stale entry can never be *read*. `stale: 0` is the important part: it
    // stops the browser's client-side router cache from pinning an old render
    // across soft navigations (Next still floors the client at 30s). Without
    // it the built-in "days" profile would let a deleted post linger in the
    // tab for up to 5 minutes after the server already had the truth.
    content: {
      stale: 0,
      revalidate: 60 * 60 * 24, // 1 day
      expire: 60 * 60 * 24 * 7, // 1 week
    },
  },
};

export default nextConfig;
