import { plainText, type BlockNode } from "./blocks";
import { slugify } from "./slug";

export type Heading = { id: string; text: string; level: 1 | 2 | 3 };

/** Where to look for headings: the page body and the columns inside it. */
function* walk(blocks: BlockNode[]): Generator<BlockNode> {
  for (const block of blocks) {
    yield block;
    if (block.type === "column_list" || block.type === "column") {
      yield* walk(block.children);
    }
  }
}

/**
 * A post's headings in reading order, each with a URL-safe anchor that's
 * unique within the post ("setup", "setup-2", ...). The table of contents and
 * the rendered headings both read `anchors`, so they can't disagree.
 */
export function headingsOf(blocks: BlockNode[]): {
  headings: Heading[];
  anchors: Map<string, string>;
} {
  const headings: Heading[] = [];
  const anchors = new Map<string, string>();
  const seen = new Map<string, number>();

  for (const block of walk(blocks)) {
    let level: Heading["level"];
    let text: string;
    if (block.type === "heading_1") {
      level = 1;
      text = plainText(block.heading_1.rich_text);
    } else if (block.type === "heading_2") {
      level = 2;
      text = plainText(block.heading_2.rich_text);
    } else if (block.type === "heading_3") {
      level = 3;
      text = plainText(block.heading_3.rich_text);
    } else {
      continue;
    }

    text = text.trim();
    if (!text) continue;

    const base = slugify(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;

    anchors.set(block.id, id);
    headings.push({ id, text, level });
  }

  return { headings, anchors };
}
