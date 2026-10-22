import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";

import type { BlockNode } from "@/lib/notion/blocks";
import { plainText } from "@/lib/notion/blocks";
import { iconOf } from "@/lib/notion/icons";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";
import { NotionIconView } from "./icon";
import { RichText } from "./rich-text";

/** Heading anchors by block id, from `headingsOf` — shared with the table of contents. */
type Anchors = ReadonlyMap<string, string>;

/**
 * Notion file URLs are pre-signed and expire after roughly an hour, so a
 * cached page must link to the proxy and let it resolve a fresh URL instead.
 */
function fileUrl(
  block: BlockNode,
  file: { type: "external" | "file"; external?: { url: string } },
): string {
  if (file.type === "external" && file.external) return file.external.url;
  return `/api/notion-image?type=block&id=${block.id}`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The player URL for a video Notion links to, or null when there isn't one:
 * most hosts refuse to be framed, so anything but YouTube and Vimeo renders
 * as a link card instead of an iframe that says "refused to connect".
 */
function embedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www|m)\./, "");

  let youtubeId: string | null | undefined;
  if (host === "youtu.be") {
    youtubeId = parsed.pathname.match(/^\/([\w-]+)$/)?.[1];
  } else if (host === "youtube.com") {
    youtubeId =
      parsed.pathname === "/watch"
        ? parsed.searchParams.get("v")
        : parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)$/)?.[1];
  }
  if (youtubeId && /^[\w-]+$/.test(youtubeId)) {
    // A share link's `t=42` / `t=42s`; the player calls it `start`.
    const start = parsed.searchParams.get("t")?.match(/^(\d+)s?$/)?.[1];
    return `https://www.youtube.com/embed/${youtubeId}${start ? `?start=${start}` : ""}`;
  }

  const vimeoId =
    host === "vimeo.com" ? parsed.pathname.match(/^\/(\d+)/)?.[1] : undefined;
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  if (host === "player.vimeo.com") return url;

  return null;
}

/** A bookmark-style card: the host, the full URL under it, opening in a new tab. */
function LinkCard({ url }: { url: string }) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-surface ring-line hover:bg-surface-hover hover:ring-line-strong flex items-center gap-3 rounded-lg px-4 py-3 ring-1 transition-[background-color,box-shadow] ring-inset"
    >
      <span className="min-w-0 flex-1">
        <span className="text-small text-fg block truncate font-medium">
          {hostOf(url)}
        </span>
        <span className="text-meta text-faint block truncate font-mono">
          {url}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="text-faint group-hover:text-fg size-3.5 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

/**
 * A post heading with a `#` link in the left margin, so any section can be
 * shared. Notion's H1–H3 render one level down: the post title is the `<h1>`.
 */
function Heading({
  as: Tag,
  id,
  className,
  children,
}: {
  as: "h2" | "h3" | "h4";
  id: string | undefined;
  className: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "group/heading text-fg relative scroll-mt-24 font-medium tracking-[-0.01em] text-balance",
        className,
      )}
    >
      {id ? (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="text-faint hover:text-fg absolute top-0 -left-5 hidden pr-1 font-normal opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100 sm:block"
        >
          #
        </a>
      ) : null}
      {children}
    </Tag>
  );
}

function Block({ block, anchors }: { block: BlockNode; anchors: Anchors }) {
  switch (block.type) {
    case "paragraph":
      // Notion emits empty paragraphs as spacing; keep them as vertical rhythm.
      if (block.paragraph.rich_text.length === 0) return <div className="h-2" />;
      return (
        <>
          <p className="text-muted leading-7">
            <RichText value={block.paragraph.rich_text} />
          </p>
          <Children blocks={block.children} anchors={anchors} indented />
        </>
      );

    case "heading_1":
      return (
        <Heading as="h2" id={anchors.get(block.id)} className="text-heading mt-12 leading-8">
          <RichText value={block.heading_1.rich_text} />
        </Heading>
      );

    case "heading_2":
      return (
        <Heading as="h3" id={anchors.get(block.id)} className="text-title mt-10 leading-7">
          <RichText value={block.heading_2.rich_text} />
        </Heading>
      );

    case "heading_3":
      return (
        <Heading as="h4" id={anchors.get(block.id)} className="text-lead mt-8 leading-6">
          <RichText value={block.heading_3.rich_text} />
        </Heading>
      );

    case "to_do":
      return (
        <li className="flex list-none items-start gap-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-sm ring-1 ring-inset",
              block.to_do.checked
                ? "bg-accent ring-accent text-white"
                : "ring-line-strong",
            )}
          >
            {block.to_do.checked ? <Check className="size-3" strokeWidth={3} /> : null}
          </span>
          <div
            className={cn(
              "min-w-0 flex-1 leading-7",
              block.to_do.checked ? "text-faint line-through" : "text-muted",
            )}
          >
            <span className="sr-only">
              {block.to_do.checked ? "Done: " : "To do: "}
            </span>
            <RichText value={block.to_do.rich_text} />
            <Children blocks={block.children} anchors={anchors} indented />
          </div>
        </li>
      );

    case "bulleted_list_item":
      return (
        <li className="text-muted marker:text-faint pl-1 leading-7">
          <RichText value={block.bulleted_list_item.rich_text} />
          <Children blocks={block.children} anchors={anchors} indented />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-muted marker:text-faint pl-1 leading-7 marker:font-mono marker:text-[0.875em]">
          <RichText value={block.numbered_list_item.rich_text} />
          <Children blocks={block.children} anchors={anchors} indented />
        </li>
      );

    case "quote":
      return (
        <blockquote className="border-line-strong text-fg text-lead border-l-2 pl-5 leading-7">
          <RichText value={block.quote.rich_text} />
          <Children blocks={block.children} anchors={anchors} />
        </blockquote>
      );

    case "callout": {
      const icon = iconOf(
        block.callout.icon,
        `/api/notion-image?type=block&id=${block.id}`,
      );
      return (
        <aside className="bg-surface ring-line flex gap-3 rounded-lg p-4 ring-1 ring-inset">
          <span className="flex h-7 shrink-0 items-center">
            {icon ? (
              <NotionIconView icon={icon} className="text-lead size-5" />
            ) : (
              <span aria-hidden className="text-lead">
                💡
              </span>
            )}
          </span>
          <div className="text-muted min-w-0 flex-1 leading-7">
            <RichText value={block.callout.rich_text} />
            <Children blocks={block.children} anchors={anchors} indented />
          </div>
        </aside>
      );
    }

    case "code":
      return (
        <figure>
          <CodeBlock
            code={plainText(block.code.rich_text)}
            language={block.code.language}
          />
          {block.code.caption.length > 0 && (
            <figcaption className="text-meta text-faint mt-2">
              <RichText value={block.code.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr className="border-line my-10" />;

    case "image":
      return (
        <figure>
          {/* Notion gives no dimensions and the proxy 307s to a signed URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl(block, block.image)}
            alt={plainText(block.image.caption) || ""}
            loading="lazy"
            decoding="async"
            className="ring-line w-full rounded-xl ring-1"
          />
          {block.image.caption.length > 0 && (
            <figcaption className="text-meta text-faint mt-2.5 text-center">
              <RichText value={block.image.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "video": {
      if (block.video.type !== "external") {
        return (
          <video
            src={fileUrl(block, block.video)}
            controls
            preload="metadata"
            className="ring-line w-full rounded-xl ring-1"
          />
        );
      }
      const player = embedUrl(block.video.external.url);
      if (!player) return <LinkCard url={block.video.external.url} />;
      return (
        <div className="ring-line aspect-video overflow-hidden rounded-xl ring-1">
          <iframe
            src={player}
            title={plainText(block.video.caption) || "Video"}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            // YouTube's player refuses to load without a referrer (error 153).
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full"
          />
        </div>
      );
    }

    case "bookmark":
    case "embed":
      return (
        <LinkCard
          url={block.type === "bookmark" ? block.bookmark.url : block.embed.url}
        />
      );

    case "toggle":
      return (
        <details className="group/toggle bg-surface ring-line rounded-lg ring-1 ring-inset">
          <summary className="text-fg hover:bg-surface-hover flex cursor-pointer list-none items-start gap-2 rounded-lg px-4 py-3 leading-7 font-medium transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden
              className="text-faint mt-1.5 size-4 shrink-0 transition-transform group-open/toggle:rotate-90"
            />
            <span>
              <RichText value={block.toggle.rich_text} />
            </span>
          </summary>
          <div className="px-4 pt-1 pb-4 pl-10">
            <Children blocks={block.children} anchors={anchors} />
          </div>
        </details>
      );

    case "column_list":
      return (
        <div className="grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {block.children.map((column) => (
            <div key={column.id} className="min-w-0">
              <Children blocks={column.children} anchors={anchors} />
            </div>
          ))}
        </div>
      );

    case "table": {
      const [head, ...body] = block.children;
      const hasHeader = block.table.has_column_header && head;
      const rows = hasHeader ? body : block.children;
      return (
        <div className="ring-line overflow-x-auto rounded-lg ring-1 ring-inset">
          <table className="text-small w-full">
            {hasHeader && head.type === "table_row" && (
              <thead className="bg-surface">
                <tr>
                  {head.table_row.cells.map((cell, index) => (
                    <th
                      key={index}
                      className="border-line text-fg border-b px-4 py-2.5 text-left font-medium"
                    >
                      <RichText value={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map(
                (row) =>
                  row.type === "table_row" && (
                    <tr key={row.id} className="border-line border-b last:border-0">
                      {row.table_row.cells.map((cell, index) => (
                        <td key={index} className="text-muted px-4 py-2.5 align-top">
                          <RichText value={cell} />
                        </td>
                      ))}
                    </tr>
                  ),
              )}
            </tbody>
          </table>
        </div>
      );
    }

    case "equation":
      return (
        <pre className="bg-surface ring-line text-ui text-fg overflow-x-auto rounded-lg p-4 text-center font-mono ring-1 ring-inset">
          {block.equation.expression}
        </pre>
      );

    // Rendered by their parent (`table`, `column_list`) or intentionally
    // skipped (`child_page` is its own post).
    case "table_row":
    case "column":
    case "child_page":
      return null;

    default:
      return null;
  }
}

/**
 * Renders a run of sibling blocks, wrapping consecutive list items in a single
 * `<ul>`/`<ol>` so numbering and bullets are continuous.
 */
function Children({
  blocks,
  anchors,
  indented = false,
}: {
  blocks: BlockNode[];
  anchors: Anchors;
  indented?: boolean;
}) {
  if (blocks.length === 0) return null;

  const groups: { type: string; items: BlockNode[] }[] = [];
  const LIST_TYPES = new Set([
    "bulleted_list_item",
    "numbered_list_item",
    "to_do",
  ]);

  for (const block of blocks) {
    const last = groups.at(-1);
    if (LIST_TYPES.has(block.type) && last?.type === block.type) {
      last.items.push(block);
    } else {
      groups.push({ type: block.type, items: [block] });
    }
  }

  return (
    <div className={cn("space-y-5", indented && "mt-2 ml-1 space-y-2")}>
      {groups.map((group, index) => {
        const key = `${group.type}-${group.items[0].id}-${index}`;
        const items = group.items.map((item) => (
          <Block key={item.id} block={item} anchors={anchors} />
        ));

        if (group.type === "numbered_list_item") {
          return (
            <ol key={key} className="ml-5 list-decimal space-y-2">
              {items}
            </ol>
          );
        }

        if (group.type === "bulleted_list_item") {
          return (
            <ul key={key} className="ml-5 list-disc space-y-2">
              {items}
            </ul>
          );
        }

        if (group.type === "to_do") {
          return (
            <ul key={key} className="space-y-2">
              {items}
            </ul>
          );
        }

        return <Fragment key={key}>{items}</Fragment>;
      })}
    </div>
  );
}

/** Entry point: renders a full Notion page body. */
export function NotionBlocks({
  blocks,
  anchors = new Map(),
}: {
  blocks: BlockNode[];
  anchors?: Anchors;
}) {
  return <Children blocks={blocks} anchors={anchors} />;
}
