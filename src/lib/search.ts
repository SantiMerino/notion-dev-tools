/**
 * Single-character accent map. Deliberately one-to-one: `fold` must not change
 * a string's length, so an index found in the folded text still points at the
 * right character in the original when building a result snippet.
 */
const FOLDED: Record<string, string> = {
  á: "a", à: "a", ä: "a", â: "a", ã: "a", å: "a",
  é: "e", è: "e", ë: "e", ê: "e",
  í: "i", ì: "i", ï: "i", î: "i",
  ó: "o", ò: "o", ö: "o", ô: "o", õ: "o",
  ú: "u", ù: "u", ü: "u", û: "u",
  ñ: "n", ç: "c", ý: "y", ÿ: "y",
};

// Built from the map's own keys so the class can never drift from it.
const ACCENTED = new RegExp(`[${Object.keys(FOLDED).join("")}]`, "g");

/** Lowercase and strip accents so "introducción" matches a query of "introduccion". */
export function fold(value: string): string {
  return value.toLowerCase().replace(ACCENTED, (char) => FOLDED[char] ?? char);
}

export type Snippet = { before: string; match: string; after: string };

/**
 * Locate `query` inside `text` and return it with surrounding context, so the
 * result can be shown with the hit highlighted. Returns null when absent.
 */
export function findSnippet(
  text: string,
  query: string,
  context = 70,
): Snippet | null {
  const index = fold(text).indexOf(fold(query));
  if (index === -1) return null;

  const start = Math.max(0, index - context);
  const end = Math.min(text.length, index + query.length + context);

  return {
    before: (start > 0 ? "…" : "") + text.slice(start, index),
    match: text.slice(index, index + query.length),
    after:
      text.slice(index + query.length, end) + (end < text.length ? "…" : ""),
  };
}
