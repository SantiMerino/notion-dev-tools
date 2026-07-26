"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import type { SearchablePost } from "@/lib/notion/posts";
import { fold, findSnippet, type Snippet } from "@/lib/search";

type Result = SearchablePost & { snippet: Snippet | null };

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
    <div className="space-y-6">
      <div className="relative">
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles and post content…"
          aria-label="Search posts"
          className="pr-10 pl-9"
        />
        {trimmed && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {trimmed && (
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {results.length === 0
            ? "No posts match "
            : `${results.length} ${results.length === 1 ? "post" : "posts"} matching `}
          <span className="text-foreground font-medium">
            &ldquo;{trimmed}&rdquo;
          </span>
        </p>
      )}

      {results.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            {posts.length === 0 ? (
              <>
                No posts yet. Add a subpage under your <strong>web-blog</strong>{" "}
                page in Notion, then reload.
              </>
            ) : (
              <>Try a different keyword.</>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {results.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.slug}`} className="group block">
                <Card className="group-hover:border-foreground/25 overflow-hidden py-0 transition-colors">
                  {post.coverUrl && (
                    // Notion gives no dimensions and the proxy 302s to a signed
                    // URL, so next/image can't help here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <CardHeader className="pt-6">
                    <CardTitle className="text-xl leading-snug">
                      {post.emoji && (
                        <span aria-hidden className="mr-2">
                          {post.emoji}
                        </span>
                      )}
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    {post.snippet ? (
                      <p className="text-muted-foreground text-sm leading-6">
                        {post.snippet.before}
                        <mark className="bg-yellow-500/25 text-foreground rounded px-0.5">
                          {post.snippet.match}
                        </mark>
                        {post.snippet.after}
                      </p>
                    ) : (
                      post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
                          {post.excerpt}
                        </p>
                      )
                    )}
                    <p className="text-muted-foreground mt-3 text-xs">
                      {formatDate(post.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
