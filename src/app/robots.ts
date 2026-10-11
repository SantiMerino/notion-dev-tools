import type { MetadataRoute } from "next";

import { absolute } from "@/lib/feed";

// /api stays crawlable: post images are served through /api/notion-image.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absolute("/sitemap.xml"),
  };
}
