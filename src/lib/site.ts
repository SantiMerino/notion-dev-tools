/**
 * Who the blog belongs to and where else he lives. Kept in step with the
 * portfolio's `src/lib/site.ts` (santimh.dev), which links back here.
 */
export const site = {
  name: "Santiago Merino",
  /** The wordmark both sites share. */
  handle: "santimh",
  title: "Writing",
  description:
    "Notes I write in Notion and publish here: what I'm building, and what I learned building it.",
  tagline: "Fullstack developer in El Salvador, building fast, accessible web apps.",
  email: "hi@santimh.dev",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://notion.santimh.dev",
  portfolioUrl: "https://santimh.dev",
} as const;

export const links = {
  github: "https://github.com/SantiMerino",
  linkedin: "https://www.linkedin.com/in/santiagomerinoh/",
} as const;
