import type { Metadata, Viewport } from "next";
import { cacheLife } from "next/cache";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { ShortcutsNote } from "@/components/shortcuts-note";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

// The portfolio's pair: Inter for text, Geist Mono for labels, dates and code.
// globals.css reads them through these two variables.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const SITE_NAME = `${site.title} — ${site.name}`;

export const metadata: Metadata = {
  // Required for the opengraph-image/twitter-image file conventions to emit
  // absolute URLs. Without it Next falls back to localhost in dev and to
  // VERCEL_URL in production -- the latter being the per-deployment hostname,
  // not the custom domain, which breaks previews on the canonical URL.
  metadataBase: new URL(site.url),
  title: {
    default: SITE_NAME,
    template: `%s · ${site.handle}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.portfolioUrl }],
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: SITE_NAME }],
      "application/feed+json": [{ url: "/feed.json", title: SITE_NAME }],
    },
  },
  // Stated explicitly rather than left to be inferred from the title/description
  // tags: crawlers that infer og:* flag it as a warning, and inference gives no
  // control over og:image at all.
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090a0c" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
  ],
};

// Reading the clock is non-deterministic, which Cache Components rejects
// during prerender. Caching it pins one value per build instead.
//
// The explicit long lifetime matters: without it this falls back to the
// `default` profile (15m), and because the layout wraps every route it would
// pull each route's revalidate down to 15m. A copyright year does not need
// refreshing more than once a month.
async function CurrentYear() {
  "use cache";
  cacheLife("max");
  return <>{new Date().getFullYear()}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes sets `data-theme` on <html> before paint, which would
    // otherwise be flagged as a hydration mismatch.
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* Dark by default and a stored choice after that, like the portfolio
            (which uses the same storage key on its own origin). */}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="santimh-theme"
          disableTransitionOnChange
        >
          <a
            href="#content"
            className="bg-surface text-small text-fg ring-line shadow-float sr-only z-50 rounded-md px-3 py-2 ring-1 ring-inset focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <ShortcutsNote />
          <ThemeToggle />
          <SiteHeader />

          <main
            id="content"
            className="mx-auto w-full max-w-[640px] flex-1 px-6 pt-16 sm:pt-20"
          >
            {children}
          </main>

          <SiteFooter year={<CurrentYear />} />
        </ThemeProvider>
      </body>
    </html>
  );
}
