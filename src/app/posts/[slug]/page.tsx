import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { NotionBlocks } from "@/components/notion/blocks";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { getPost, getPosts, getSeriesLinks } from "@/lib/notion/posts";
import { openGraphImage, twitterImage } from "@/app/shared-metadata";

/**
 * Prerender every published post. This also tells Cache Components that
 * `params` is known ahead of time, so the page can enter the static shell.
 */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/posts/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      ...openGraphImage,
      title: post.title,
      description: post.excerpt || undefined,
      url: `/posts/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt,
    },
    // Restated per-post: the root layout's `twitter` block would otherwise be
    // inherited verbatim, captioning every shared post with the site title.
    twitter: {
      ...twitterImage,
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
    },
  };
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);

  if (!post) notFound();

  const seriesLinks = await getSeriesLinks(post);
  const seriesIndex = seriesLinks.findIndex((link) => link.slug === post.slug);
  const prevInSeries = seriesIndex > 0 ? seriesLinks[seriesIndex - 1] : null;
  const nextInSeries =
    seriesIndex >= 0 && seriesIndex < seriesLinks.length - 1
      ? seriesLinks[seriesIndex + 1]
      : null;

  return (
    <article>
      {/* Kept outside the spacing flow below so the gap under it is set here
          rather than fought with an !important override. */}
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-12 inline-block text-sm transition-colors sm:mb-16"
      >
        ← All posts
      </Link>

      <div className="space-y-8">
        <header className="space-y-3">
          {post.emoji && (
            <div aria-hidden className="text-5xl">
              {post.emoji}
            </div>
          )}
          {post.series && (
            <Badge variant="secondary" className="w-fit">
              {post.series.seriesTitle} · Parte {post.series.part} de{" "}
              {post.series.total}
            </Badge>
          )}
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {post.series ? post.series.displayTitle : post.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.updatedAt !== post.createdAt && (
              <> · updated {formatDate(post.updatedAt)}</>
            )}
          </p>
        </header>

        {post.coverUrl && (
        // Notion gives no dimensions and the proxy 302s to a signed URL, so
        // next/image can't help here.
        // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt=""
            className="h-56 w-full rounded-lg border object-cover"
          />
        )}

        <Separator />

        <NotionBlocks blocks={post.blocks} />

        {seriesLinks.length > 1 && (
          <>
            <Separator />
            <nav
              aria-label="Series navigation"
              className="grid gap-3 sm:grid-cols-2"
            >
              {prevInSeries ? (
                <Link
                  href={`/posts/${prevInSeries.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/25"
                >
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <ArrowLeft className="size-3.5" /> Parte {prevInSeries.part}
                  </span>
                  <span className="font-medium group-hover:underline">
                    {prevInSeries.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextInSeries && (
                <Link
                  href={`/posts/${nextInSeries.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border p-4 text-right transition-colors hover:border-foreground/25 sm:col-start-2"
                >
                  <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                    Parte {nextInSeries.part} <ArrowRight className="size-3.5" />
                  </span>
                  <span className="font-medium group-hover:underline">
                    {nextInSeries.title}
                  </span>
                </Link>
              )}
            </nav>
          </>
        )}
      </div>
    </article>
  );
}
