import type { SeriesInfo } from "@/lib/notion/posts";
import { cn } from "@/lib/utils";

/**
 * The portfolio's series chip: the series name, then "2/2" in mono. The
 * sr-only pieces fill in what the eye gets from the layout, so a screen reader
 * says "Canvas + Notion · Parte 2 de 2" rather than "Canvas + Notion 2 slash 2".
 */
export function SeriesChip({
  series,
  className,
}: {
  series: SeriesInfo;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-meta text-muted ring-line inline-flex h-5 max-w-full items-center gap-1.5 rounded-full px-2 leading-none ring-1 ring-inset",
        className,
      )}
    >
      <span className="truncate">{series.seriesTitle}</span>
      <span className="sr-only"> · Parte </span>
      <span className="text-micro text-faint font-mono">
        {series.part}
        <span aria-hidden>/</span>
        <span className="sr-only"> de </span>
        {series.total}
      </span>
    </span>
  );
}
