import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";

import { PixelCursor } from "@/components/brand";
import { site } from "@/lib/site";

/**
 * The portfolio's top bar, in the same 640px column: the shared wordmark on
 * the left (here with the blog's own path after it), quiet mono links on the
 * right. The theme toggle floats in the corner, outside this row.
 */
export function SiteHeader() {
  return (
    <header className="animate-reveal mx-auto w-full max-w-[640px] px-6 pt-16 sm:pt-20">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group text-fg inline-flex items-center gap-2.5 rounded-md"
        >
          <PixelCursor className="block h-auto w-3 drop-shadow-[0_2px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5" />
          <span className="text-lead leading-none font-medium tracking-tight">
            {site.handle}
          </span>
          <span aria-hidden className="text-line-strong text-lead leading-none">
            /
          </span>
          <span className="text-muted group-hover:text-fg text-lead leading-none transition-colors">
            writing
          </span>
        </Link>

        <nav aria-label="Elsewhere" className="text-faint flex items-center gap-4">
          <a
            href={site.portfolioUrl}
            className="mono-xs hover:text-fg -m-2 inline-flex items-center gap-1 p-2 uppercase transition-colors"
          >
            <span className="hidden sm:inline">Portfolio</span>
            <span className="sm:hidden">santimh.dev</span>
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
          <a
            href="/feed.xml"
            aria-label="RSS feed"
            className="hover:text-fg -m-2 inline-flex p-2 transition-colors"
          >
            <Rss aria-hidden className="size-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
