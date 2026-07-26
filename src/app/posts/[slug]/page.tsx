import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NotionBlocks } from "@/components/notion/blocks";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { getPost, getPosts } from "@/lib/notion/posts";

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
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.createdAt,
    },
  };
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);

  if (!post) notFound();

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
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {post.title}
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
      </div>
    </article>
  );
}
