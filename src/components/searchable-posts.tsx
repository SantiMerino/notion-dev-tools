"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

import { NotionIconView } from "@/components/notion/icon";
import { SeriesChip } from "@/components/series-chip";
import { FOCUS_SEARCH_KEY, SEARCH_INPUT_ID } from "@/components/shortcuts-note";
import { formatDate, formatDay, formatMonth, monthKey } from "@/lib/format";
import type { SearchablePost } from "@/lib/notion/posts";
import { fold, findSnippet, type Snippet } from "@/lib/search";

type Result = SearchablePost & { snippet: Snippet | null };

/** Stagger index for the portfolio's entrance, capped so a long archive doesn't wait. */
const reveal = (index: number): CSSProperties =>
  ({ "--i": Math.min(index, 12) }) as CSSProperties;

export function SearchablePosts({ posts }: { posts: SearchablePost[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();

  // `/` pressed on another page brings the visitor here; take focus on arrival.
  // (On this page the shortcut focuses the box by its id.)
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(FOCUS_SEARCH_KEY)) return;
      sessionStorage.removeItem(FOCUS_SEARCH_KEY);
    } catch {
      return;
    }
    input.current?.focus();
  }, []);

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

  if (posts.length === 0) {
    return (
      <p className="text-body text-muted">
        No posts yet — the first one is on its way.
      </p>
    );
  }

  // The newest post leads as a card until a search starts; then every match
  // goes on the rail, so results read as one list.
  const lead = trimmed ? null : (results[0] ?? null);
  const rest = trimmed ? results : results.slice(1);

  return (
    <div>
      <div className="animate-reveal relative" style={reveal(2)}>
        <Search
          aria-hidden
          className="text-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          ref={input}
          id={SEARCH_INPUT_ID}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
          placeholder="Search posts"
          aria-label="Search posts"
          aria-keyshortcuts="/"
          className="bg-surface text-body text-fg placeholder:text-faint ring-line focus-visible:ring-line-strong hover:ring-line-strong h-10 w-full appearance-none rounded-md pr-10 pl-9 ring-1 transition-shadow ring-inset outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {trimmed ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
            aria-label="Clear search"
            className="text-faint hover:text-fg absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm transition-colors"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : (
          <kbd
            aria-hidden
            className="text-micro text-faint ring-line pointer-events-none absolute top-1/2 right-3 hidden h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-sm px-1 font-mono ring-1 ring-inset sm:inline-flex"
          >
            /
          </kbd>
        )}
      </div>

      {/* Always mounted so screen readers hear the count change; it only
          takes up space while there's a query to report on. */}
      <p
        aria-live="polite"
        className={trimmed ? "text-ui text-faint mt-4" : "sr-only"}
      >
        {trimmed ? (
          <>
            {results.length === 0
              ? "No posts match "
              : `${results.length} ${results.length === 1 ? "post" : "posts"} matching `}
            <span className="text-fg font-medium">&ldquo;{trimmed}&rdquo;</span>
          </>
        ) : null}
      </p>

      {lead ? (
        <div className="animate-reveal-flat mt-6" style={reveal(3)}>
          <LeadPost post={lead} />
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className={lead ? "mt-10 px-5 sm:px-6" : "mt-6 px-5 sm:px-6"}>
          <Timeline posts={rest} offset={4} />
        </div>
      ) : null}

      {trimmed && results.length === 0 ? (
        <p className="text-body text-muted mt-6">Try a different keyword.</p>
      ) : null}
    </div>
  );
}

/** The newest post, as the portfolio's "Latest" card. */
function LeadPost({ post }: { post: Result }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group bg-surface ring-line hover:bg-surface-hover hover:ring-line-strong block rounded-lg p-5 ring-1 transition-[background-color,box-shadow] ring-inset sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="mono-xs text-faint inline-flex items-center gap-2 whitespace-nowrap">
          <span aria-hidden className="bg-accent size-1.5 rounded-full" />
          Latest
        </span>
        <time
          dateTime={post.createdAt}
          className="mono-xs text-faint whitespace-nowrap"
        >
          {formatDate(post.createdAt)}
        </time>
      </div>

      {post.icon ? (
        <NotionIconView
          icon={post.icon}
          className="mt-6 block size-7 text-[28px]"
        />
      ) : null}
      {post.series ? (
        <SeriesChip
          series={post.series}
          className={post.icon ? "mt-4" : "mt-6"}
        />
      ) : null}
      <h2
        className={`${post.series ? "mt-2.5" : post.icon ? "mt-4" : "mt-6"} text-title leading-7 font-medium tracking-[-0.01em] text-balance`}
      >
        <span className="link-underline">
          {post.series ? post.series.displayTitle : post.title}
        </span>
      </h2>
      <PostSummary post={post} className="text-body mt-2 line-clamp-3" />

      <span className="mt-6 flex items-center justify-between gap-4">
        <span className="text-ui text-fg inline-flex items-center gap-1.5 font-medium">
          Read post
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
        {post.readingMinutes ? (
          <span className="mono-xs text-faint">{post.readingMinutes} min read</span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * The portfolio's notebook rail: posts hang off one vertical line, grouped by
 * the month they went out. The rail is inset by the lead card's padding so it
 * drops straight down from the card's green "Latest" dot.
 */
function Timeline({ posts, offset }: { posts: Result[]; offset: number }) {
  // Posts arrive newest first, so months come out in order too.
  const months: { key: string; label: string; posts: Result[] }[] = [];
  for (const post of posts) {
    const key = monthKey(post.createdAt);
    const month = months.at(-1);
    if (month?.key === key) month.posts.push(post);
    else months.push({ key, label: formatMonth(post.createdAt), posts: [post] });
  }

  let index = offset;

  return (
    <div className="space-y-8">
      {months.map((month) => (
        <section key={month.key} aria-label={month.label}>
          <p className="label animate-reveal" style={reveal(index++)}>
            {month.label}
          </p>
          {/* 2.5px puts the 1px rail's centre under the 6px "Latest" dot. */}
          <ol className="border-line mt-4 ml-[2.5px] border-l">
            {month.posts.map((post) => (
              <li
                key={post.id}
                className="animate-reveal pb-6 last:pb-0"
                style={reveal(index++)}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="group relative -my-1 block rounded-lg py-1 pl-6"
                >
                  {/* The stop on the rail; it lights up with the post. */}
                  <span
                    aria-hidden
                    className="bg-bg ring-line-strong group-hover:bg-accent group-hover:ring-accent group-focus-visible:bg-accent group-focus-visible:ring-accent absolute top-[11px] -left-[5px] size-[9px] rounded-full ring-1 transition-colors"
                  />
                  <span className="flex min-w-0 items-center gap-2.5">
                    <time
                      dateTime={post.createdAt}
                      className="mono-xs text-faint shrink-0"
                    >
                      {formatDay(post.createdAt)}
                    </time>
                    {post.icon ? (
                      <NotionIconView
                        icon={post.icon}
                        className="text-small size-3.5"
                      />
                    ) : null}
                    {post.readingMinutes ? (
                      <span className="mono-xs text-faint">
                        · {post.readingMinutes} min
                      </span>
                    ) : null}
                  </span>
                  {post.series ? (
                    <SeriesChip series={post.series} className="mt-2" />
                  ) : null}
                  <h2 className="text-body text-fg mt-1.5 flex items-start gap-1.5 leading-6 font-medium">
                    <span className="link-underline">
                      {post.series ? post.series.displayTitle : post.title}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="text-faint group-hover:text-fg mt-1 size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                  </h2>
                  <PostSummary
                    post={post}
                    className="text-small mt-1 line-clamp-2 leading-[22px]"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/** The search hit in context when there is one, the excerpt otherwise. */
function PostSummary({ post, className }: { post: Result; className: string }) {
  if (post.snippet) {
    return (
      <p className={`text-muted ${className}`}>
        {post.snippet.before}
        <mark className="text-fg bg-accent/20 rounded-xs px-0.5">
          {post.snippet.match}
        </mark>
        {post.snippet.after}
      </p>
    );
  }
  if (!post.excerpt) return null;
  return <p className={`text-muted ${className}`}>{post.excerpt}</p>;
}
