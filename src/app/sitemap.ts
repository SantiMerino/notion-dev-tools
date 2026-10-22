import type { MetadataRoute } from "next";

import { absolute, lastEdited } from "@/lib/feed";
import { getPosts } from "@/lib/notion/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    {
      url: absolute("/"),
      lastModified: lastEdited(posts),
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
