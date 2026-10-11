import type { MetadataRoute } from "next";

import { absolute } from "@/lib/feed";
import { getPosts } from "@/lib/notion/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    {
      url: absolute("/"),
      lastModified: posts[0]?.updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: absolute(`/posts/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
