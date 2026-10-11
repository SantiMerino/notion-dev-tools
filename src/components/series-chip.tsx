import type { SeriesInfo } from "@/lib/notion/posts";
import { cn } from "@/lib/utils";

/**
 * The portfolio's series chip: the series name, then "2/2" in mono.
 *
 * It's a `<p>` on purpose, and its text reads "Canvas + Notion · Parte 2 de 2"
 * (the sr-only pieces fill in what the eye gets from the layout). santimh.dev
 * lists the latest posts by reading this page's HTML, and takes the `<p>` right
 * before a card's `<h2>` as that line — see santimh/server/writing.ts.
 */
export function SeriesChip({
  series,
  className,
}: {
  series: SeriesInfo;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-meta text-muted ring-line inline-flex h-5 max-w-full items-center gap-1.5 rounded-full px-2 leading-none ring-1 ring-inset",
        className,
      )}
    >
      <span className="truncate">{series.seriesTitle}</span>
      <span className="sr-only"> · Parte </span>
      <span className="text-micro text-faint font-mono">
        {series.part}
        <span className="sr-only"> de </span>
        {/* The slash is drawn by CSS, so it never lands in the page's text. */}
        <span aria-hidden className="before:content-['/']" />
        {series.total}
      </span>
    </p>
  );
}
