import Link from "next/link";
import type { RichTextItemResponse } from "@notionhq/client";

import { cn } from "@/lib/utils";

const TEXT_COLORS: Record<string, string> = {
  gray: "text-neutral-500",
  brown: "text-amber-800 dark:text-amber-600",
  orange: "text-orange-600 dark:text-orange-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
  pink: "text-pink-600 dark:text-pink-400",
  red: "text-red-600 dark:text-red-400",
};

const BACKGROUND_COLORS: Record<string, string> = {
  gray_background: "bg-neutral-500/15",
  brown_background: "bg-amber-700/15",
  orange_background: "bg-orange-500/15",
  yellow_background: "bg-yellow-500/20",
  green_background: "bg-green-500/15",
  blue_background: "bg-blue-500/15",
  purple_background: "bg-purple-500/15",
  pink_background: "bg-pink-500/15",
  red_background: "bg-red-500/15",
};

function colorClass(color: string): string | undefined {
  if (color === "default") return undefined;
  return color.endsWith("_background")
    ? cn("rounded px-1 py-0.5", BACKGROUND_COLORS[color])
    : TEXT_COLORS[color];
}

/** Renders one Notion rich-text array with its annotations and links. */
export function RichText({ value }: { value: RichTextItemResponse[] }) {
  if (value.length === 0) return null;

  return (
    <>
      {value.map((item, index) => {
        const { bold, italic, strikethrough, underline, code, color } =
          item.annotations;

        let node: React.ReactNode = item.plain_text;

        if (code) {
          node = (
            <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              {node}
            </code>
          );
        }
        if (bold) node = <strong className="font-semibold">{node}</strong>;
        if (italic) node = <em>{node}</em>;
        if (strikethrough) node = <s>{node}</s>;
        if (underline) node = <u>{node}</u>;

        const className = colorClass(color);
        if (className) node = <span className={className}>{node}</span>;

        if (item.href) {
          const external = !item.href.startsWith("/");
          return (
            <Link
              key={index}
              href={item.href}
              className="decoration-muted-foreground hover:decoration-foreground underline underline-offset-4 transition-colors"
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {node}
            </Link>
          );
        }

        return <span key={index}>{node}</span>;
      })}
    </>
  );
}
