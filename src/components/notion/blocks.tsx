import Link from "next/link";
import { Fragment } from "react";

import type { BlockNode } from "@/lib/notion/blocks";
import { plainText } from "@/lib/notion/blocks";
import { cn } from "@/lib/utils";

import { RichText } from "./rich-text";

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

function Block({ block }: { block: BlockNode }) {
  switch (block.type) {
    case "paragraph":
      // Notion emits empty paragraphs as spacing; keep them as vertical rhythm.
      if (block.paragraph.rich_text.length === 0) return <div className="h-4" />;
      return (
        <>
          <p className="leading-7">
            <RichText value={block.paragraph.rich_text} />
          </p>
          <Children blocks={block.children} indented />
        </>
      );

    case "heading_1":
      return (
        <h2 className="mt-10 scroll-m-20 text-3xl font-semibold tracking-tight">
          <RichText value={block.heading_1.rich_text} />
        </h2>
      );

    case "heading_2":
      return (
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          <RichText value={block.heading_2.rich_text} />
        </h3>
      );

    case "heading_3":
      return (
        <h4 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight">
          <RichText value={block.heading_3.rich_text} />
        </h4>
      );

    case "to_do":
      return (
        <li className="flex list-none items-start gap-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-1 flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] leading-none",
              block.to_do.checked
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-muted-foreground/40",
            )}
          >
            {block.to_do.checked ? "✓" : ""}
          </span>
          <div
            className={cn(
              "min-w-0 flex-1 leading-7",
              block.to_do.checked && "text-muted-foreground line-through",
            )}
          >
            <RichText value={block.to_do.rich_text} />
            <Children blocks={block.children} indented />
          </div>
        </li>
      );

    case "bulleted_list_item":
      return (
        <li className="leading-7">
          <RichText value={block.bulleted_list_item.rich_text} />
          <Children blocks={block.children} indented />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="leading-7">
          <RichText value={block.numbered_list_item.rich_text} />
          <Children blocks={block.children} indented />
        </li>
      );

    case "quote":
      return (
        <blockquote className="border-foreground/20 text-muted-foreground border-l-2 pl-6 italic">
          <RichText value={block.quote.rich_text} />
          <Children blocks={block.children} />
        </blockquote>
      );

    case "callout": {
      const icon =
        block.callout.icon?.type === "emoji" ? block.callout.icon.emoji : "💡";
      return (
        <aside className="bg-muted/60 flex gap-3 rounded-lg border p-4">
          <span aria-hidden className="text-lg leading-7">
            {icon}
          </span>
          <div className="min-w-0 flex-1 leading-7">
            <RichText value={block.callout.rich_text} />
            <Children blocks={block.children} />
          </div>
        </aside>
      );
    }

    case "code":
      return (
        <figure>
          <div className="bg-muted relative overflow-hidden rounded-lg border">
            <div className="text-muted-foreground border-b px-4 py-1.5 font-mono text-xs">
              {block.code.language}
            </div>
            <pre className="overflow-x-auto p-4 text-sm">
              <code className="font-mono">
                {plainText(block.code.rich_text)}
              </code>
            </pre>
          </div>
          {block.code.caption.length > 0 && (
            <figcaption className="text-muted-foreground mt-2 text-sm">
              <RichText value={block.code.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr className="my-10" />;

    case "image":
      return (
        <figure>
          {/* Notion gives no dimensions and the proxy 302s to a signed URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl(block, block.image)}
            alt={plainText(block.image.caption) || ""}
            loading="lazy"
            className="w-full rounded-lg border"
          />
          {block.image.caption.length > 0 && (
            <figcaption className="text-muted-foreground mt-2 text-center text-sm">
              <RichText value={block.image.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return block.video.type === "external" ? (
        <div className="aspect-video overflow-hidden rounded-lg border">
          <iframe
            src={block.video.external.url.replace("watch?v=", "embed/")}
            title={plainText(block.video.caption) || "Video"}
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : (
        <video
          src={fileUrl(block, block.video)}
          controls
          className="w-full rounded-lg border"
        />
      );

    case "bookmark":
    case "embed": {
      const url =
        block.type === "bookmark" ? block.bookmark.url : block.embed.url;
      return (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-muted/60 block truncate rounded-lg border px-4 py-3 text-sm transition-colors"
        >
          <span className="text-muted-foreground">Link → </span>
          {url}
        </Link>
      );
    }

    case "toggle":
      return (
        <details className="group rounded-lg border px-4 py-3">
          <summary className="cursor-pointer leading-7 font-medium marker:text-neutral-400">
            <RichText value={block.toggle.rich_text} />
          </summary>
          <div className="mt-3">
            <Children blocks={block.children} />
          </div>
        </details>
      );

    case "column_list":
      return (
        <div className="grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {block.children.map((column) => (
            <div key={column.id} className="min-w-0">
              <Children blocks={column.children} />
            </div>
          ))}
        </div>
      );

    case "table": {
      const [head, ...body] = block.children;
      const hasHeader = block.table.has_column_header && head;
      const rows = hasHeader ? body : block.children;
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            {hasHeader && head.type === "table_row" && (
              <thead className="bg-muted/60">
                <tr>
                  {head.table_row.cells.map((cell, index) => (
                    <th
                      key={index}
                      className="border-b px-4 py-2 text-left font-medium"
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
                    <tr key={row.id} className="border-b last:border-0">
                      {row.table_row.cells.map((cell, index) => (
                        <td key={index} className="px-4 py-2 align-top">
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
        <pre className="bg-muted overflow-x-auto rounded-lg border p-4 text-center font-mono text-sm">
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
export function Children({
  blocks,
  indented = false,
}: {
  blocks: BlockNode[];
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
    <div className={cn("space-y-4", indented && "mt-2 ml-1 space-y-2")}>
      {groups.map((group, index) => {
        const key = `${group.type}-${group.items[0].id}-${index}`;

        if (group.type === "numbered_list_item") {
          return (
            <ol key={key} className="ml-6 list-decimal space-y-2">
              {group.items.map((item) => (
                <Block key={item.id} block={item} />
              ))}
            </ol>
          );
        }

        if (group.type === "bulleted_list_item") {
          return (
            <ul key={key} className="ml-6 list-disc space-y-2">
              {group.items.map((item) => (
                <Block key={item.id} block={item} />
              ))}
            </ul>
          );
        }

        if (group.type === "to_do") {
          return (
            <ul key={key} className="space-y-2">
              {group.items.map((item) => (
                <Block key={item.id} block={item} />
              ))}
            </ul>
          );
        }

        return (
          <Fragment key={key}>
            <Block block={group.items[0]} />
          </Fragment>
        );
      })}
    </div>
  );
}

/** Entry point: renders a full Notion page body. */
export function NotionBlocks({ blocks }: { blocks: BlockNode[] }) {
  return <Children blocks={blocks} />;
}
