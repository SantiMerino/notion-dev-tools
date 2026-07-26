import { Client } from "@notionhq/client";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/**
 * Server-only Notion client. Never import this from a "use client" module —
 * the integration token must not reach the browser bundle.
 */
export const notion = new Client({ auth: requireEnv("NOTION_TOKEN") });

/** The Notion page whose child pages are the blog posts. */
export function blogPageId(): string {
  return requireEnv("NOTION_BLOG_PAGE_ID");
}
