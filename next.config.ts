import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt into the Cache Components model so `use cache` / `cacheLife` /
  // `cacheTag` are available. Notion content is cached and served from the
  // static shell, then refreshed on a timer or via /api/revalidate.
  cacheComponents: true,
};

export default nextConfig;
