"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

import { formatShortDate } from "@/lib/format";
import type { SearchablePost } from "@/lib/notion/posts";
import { fold, findSnippet, type Snippet } from "@/lib/search";

type Result = SearchablePost & { snippet: Snippet | null };

// Rows animate in on mount only -- React keeps the DOM node for a post that
// survives a search, so filtering doesn't replay the stagger on every keystroke.
// Capped so a long archive doesn't end with rows waiting seconds for their turn.
const STAGGER_MS = 55;
const MAX_STAGGERED = 10;

export function SearchablePosts({ posts }: { posts: SearchablePost[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const results = useMemo<Result[]>(() => {
    if (!trimmed) return posts.map((post) => ({ ...post, snippet: null }));

    const needle = fold(trimmed);

    return posts.flatMap((post) => {
      const inTitle = fold(post.title).includes(needle);
      const snippet = findSnippet(post.searchText, trimmed);
      if (!inTitle && !snippet) return [];
      // Only show a body snippet when the title alone doesn't explain the hit.
      return [{ ...post, snippet: inTitle ? null : snippet }];
    });
  }, [posts, trimmed]);

  return (
    <div>
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground/70 pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search posts"
          className="peer placeholder:text-muted-foreground/60 w-full appearance-none border-0 bg-transparent py-3 pr-8 pl-7 text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <span
          aria-hidden
          className="bg-border absolute inset-x-0 bottom-0 h-px"
        />
        {/* Focus ring is suppressed above, so the sweeping rule is the only
            focus affordance -- it has to be unmistakable, not decorative. */}
        <span
          aria-hidden
          className="bg-foreground absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out peer-focus:scale-x-100 motion-reduce:transition-none"
        />
        {trimmed && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-0 -translate-y-1/2 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {trimmed && (
        <p aria-live="polite" className="text-muted-foreground pt-6 text-sm">
          {results.length === 0
            ? "No posts match "
            : `${results.length} ${results.length === 1 ? "post" : "posts"} matching `}
          <span className="text-foreground font-medium">
            &ldquo;{trimmed}&rdquo;
          </span>
        </p>
      )}

      {results.length === 0 ? (
        <p className="text-muted-foreground py-16 text-sm">
          {posts.length === 0 ? (
            <>
              No posts yet. Add a subpage under your <strong>web-blog</strong>{" "}
              page in Notion, then reload.
            </>
          ) : (
            <>Try a different keyword.</>
          )}
        </p>
      ) : (
        <ul className="mt-2">
          {results.map((post, index) => (
            <li
              key={post.id}
              style={{
                animationDelay: `${Math.min(index, MAX_STAGGERED) * STAGGER_MS}ms`,
              }}
              className="border-border/70 motion-safe:animate-rise border-b last:border-b-0"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="group grid gap-x-10 gap-y-2 py-7 outline-none sm:grid-cols-[6.5rem_1fr]"
              >
                <time
                  dateTime={post.createdAt}
                  className="text-muted-foreground group-hover:text-foreground/70 group-focus-visible:text-foreground/70 text-xs tracking-wide tabular-nums transition-colors duration-300 sm:pt-1.5"
                >
                  {formatShortDate(post.createdAt)}
                </time>

                <div className="min-w-0">
                  {post.series && (
                    <p className="text-muted-foreground mb-1.5 text-[0.6875rem] tracking-[0.12em] uppercase">
                      {post.series.seriesTitle} · Parte {post.series.part} de{" "}
                      {post.series.total}
                    </p>
                  )}

                  <h2 className="text-lg leading-snug font-medium tracking-tight">
                    {post.emoji && (
                      <span aria-hidden className="mr-2">
                        {post.emoji}
                      </span>
                    )}
                    <span className="link-underline">
                      {post.series ? post.series.displayTitle : post.title}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="mb-0.5 ml-1.5 inline-block size-4 -translate-x-1 opacity-0 transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-60 group-focus-visible:translate-x-0 group-focus-visible:opacity-60 motion-reduce:transition-none"
                    />
                  </h2>

                  {post.snippet ? (
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {post.snippet.before}
                      <mark className="text-foreground rounded bg-yellow-500/25 px-0.5">
                        {post.snippet.match}
                      </mark>
                      {post.snippet.after}
                    </p>
                  ) : (
                    post.excerpt && (
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-6">
                        {post.excerpt}
                      </p>
                    )
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
