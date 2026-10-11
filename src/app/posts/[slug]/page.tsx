import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail } from "lucide-react";

import { openGraphImage, twitterImage } from "@/app/shared-metadata";
import { PixelCursor } from "@/components/brand";
import { NotionBlocks } from "@/components/notion/blocks";
import { NotionIconView } from "@/components/notion/icon";
import { PostToc } from "@/components/post-toc";
import { SeriesChip } from "@/components/series-chip";
import { formatDate, formatShortDate } from "@/lib/format";
import { headingsOf } from "@/lib/notion/headings";
import { getPost, getPosts, getSeriesLinks } from "@/lib/notion/posts";
import { site } from "@/lib/site";

const reveal = (index: number): CSSProperties =>
  ({ "--i": index }) as CSSProperties;

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
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      ...openGraphImage,
      title: post.title,
      description: post.excerpt || undefined,
      url: `/posts/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [site.portfolioUrl],
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

  const [seriesLinks, allPosts] = await Promise.all([
    getSeriesLinks(post),
    getPosts(),
  ]);
  const seriesIndex = seriesLinks.findIndex((link) => link.slug === post.slug);
  const prevInSeries = seriesIndex > 0 ? seriesLinks[seriesIndex - 1] : null;
  const nextInSeries =
    seriesIndex >= 0 && seriesIndex < seriesLinks.length - 1
      ? seriesLinks[seriesIndex + 1]
      : null;

  // Series siblings already have their own links above the sign-off.
  const inSeries = new Set(seriesLinks.map((link) => link.slug));
  const morePosts = allPosts
    .filter((other) => other.slug !== post.slug && !inSeries.has(other.slug))
    .slice(0, 3);

  const { headings, anchors } = headingsOf(post.blocks);
  const updated = post.updatedAt.slice(0, 10) !== post.createdAt.slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    url: new URL(`/posts/${post.slug}`, site.url).toString(),
    author: { "@type": "Person", name: site.name, url: site.portfolioUrl },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {headings.length >= 3 ? <PostToc headings={headings} /> : null}

      <Link
        href="/"
        className="animate-reveal mono-xs text-faint hover:text-fg group -m-1 inline-flex items-center gap-1.5 p-1 uppercase transition-colors"
      >
        <ArrowLeft
          aria-hidden
          className="size-3.5 transition-transform group-hover:-translate-x-0.5"
        />
        All posts
      </Link>

      <header className="mt-10 sm:mt-12">
        {post.icon ? (
          <div className="animate-reveal mb-6" style={reveal(1)}>
            <NotionIconView icon={post.icon} className="text-display size-10" />
          </div>
        ) : null}
        {post.series ? (
          <div className="animate-reveal mb-3" style={reveal(1)}>
            <SeriesChip series={post.series} />
          </div>
        ) : null}
        <h1
          className="animate-reveal text-display text-fg leading-10 font-medium tracking-[-0.02em] text-balance"
          style={reveal(2)}
        >
          {post.series ? post.series.displayTitle : post.title}
        </h1>
        <p
          className="animate-reveal mono-xs text-faint mt-5 flex flex-wrap items-center gap-x-2 gap-y-1"
          style={reveal(3)}
        >
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {updated ? (
            <>
              <span aria-hidden>·</span>
              <span>
                Updated{" "}
                <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
      </header>

      {post.coverUrl && (
        <div className="animate-reveal-flat mt-10" style={reveal(4)}>
          {/* Notion gives no dimensions and the proxy 307s to a signed URL, so
              next/image can't help here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt=""
            className="ring-line h-56 w-full rounded-xl object-cover ring-1 sm:h-64"
          />
        </div>
      )}

      <hr className="border-line my-10" />

      <div className="animate-reveal-flat" style={reveal(4)}>
        <NotionBlocks blocks={post.blocks} anchors={anchors} />
      </div>

      {seriesLinks.length > 1 && (
        <nav
          aria-label={`${post.series?.seriesTitle ?? "Series"}: other parts`}
          className="mt-16 grid gap-3 sm:grid-cols-2"
        >
          {prevInSeries ? (
            <Link
              href={`/posts/${prevInSeries.slug}`}
              className="group bg-surface ring-line hover:bg-surface-hover hover:ring-line-strong flex flex-col gap-1.5 rounded-lg p-4 ring-1 transition-[background-color,box-shadow] ring-inset"
            >
              <span className="mono-xs text-faint flex items-center gap-1.5">
                <ArrowLeft
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
                Parte {prevInSeries.part}
              </span>
              <span className="text-small text-fg font-medium">
                {prevInSeries.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
          {nextInSeries && (
            <Link
              href={`/posts/${nextInSeries.slug}`}
              className="group bg-surface ring-line hover:bg-surface-hover hover:ring-line-strong flex flex-col gap-1.5 rounded-lg p-4 text-right ring-1 transition-[background-color,box-shadow] ring-inset sm:col-start-2"
            >
              <span className="mono-xs text-faint flex items-center justify-end gap-1.5">
                Parte {nextInSeries.part}
                <ArrowRight
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-small text-fg font-medium">
                {nextInSeries.title}
              </span>
            </Link>
          )}
        </nav>
      )}

      <SignOff />

      {morePosts.length > 0 ? (
        <section aria-labelledby="more-posts" className="mt-16">
          <h2 id="more-posts" className="label">
            Keep reading
          </h2>
          <ul className="mt-5 -mx-3">
            {morePosts.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/posts/${other.slug}`}
                  className="group hover:bg-surface flex items-baseline gap-4 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <time
                    dateTime={other.createdAt}
                    className="mono-xs text-faint w-24 shrink-0"
                  >
                    {formatShortDate(other.createdAt)}
                  </time>
                  <span className="text-small text-muted group-hover:text-fg min-w-0 flex-1 transition-colors">
                    {other.series
                      ? `${other.series.seriesTitle}: ${other.series.displayTitle}`
                      : other.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="text-faint group-hover:text-fg size-3.5 shrink-0 self-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

/** Who wrote it, and the way back to the portfolio. */
function SignOff() {
  return (
    <aside className="bg-surface ring-line mt-16 flex items-start gap-4 rounded-lg p-5 ring-1 ring-inset sm:p-6">
      <span className="bg-surface-hover ring-line flex size-10 shrink-0 items-center justify-center rounded-md ring-1 ring-inset">
        <PixelCursor className="block h-auto w-3 drop-shadow-[0_2px_3px_rgb(0_0_0/0.25)]" />
      </span>
      <div className="min-w-0">
        <p className="text-small text-fg font-medium">Written by {site.name}</p>
        <p className="text-small text-muted mt-1 leading-6">{site.tagline}</p>
        <div className="text-ui mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={site.portfolioUrl}
            className="group text-fg inline-flex items-center gap-1.5 font-medium"
          >
            santimh.dev
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
          <a
            href={`mailto:${site.email}`}
            className="text-muted hover:text-fg inline-flex items-center gap-1.5 transition-colors"
          >
            <Mail aria-hidden className="size-3.5" />
            {site.email}
          </a>
        </div>
      </div>
    </aside>
  );
}
