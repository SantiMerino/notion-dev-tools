/** Turn a Notion page title into a URL-safe slug. */
export function slugify(title: string): string {
  return (
    title
      // NFD splits "ó" into "o" + a combining mark, which \p{M} then drops,
      // so "Introducción" slugs as "introduccion" instead of "introducci-n".
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

/**
 * Assign a unique slug per title. Posts are passed oldest-first so the oldest
 * post keeps the clean slug and later collisions get an id suffix, which keeps
 * existing URLs stable as new posts are added.
 */
export function uniqueSlug(
  base: string,
  id: string,
  taken: Set<string>,
): string {
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  const suffixed = `${base}-${id.replace(/-/g, "").slice(0, 6)}`;
  taken.add(suffixed);
  return suffixed;
}
