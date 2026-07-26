import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPosts } from "@/lib/notion/posts";
import { formatDate } from "@/lib/format";

async function PostList() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          No posts yet. Add a subpage under your <strong>web-blog</strong> page
          in Notion, then reload.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
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
                {post.excerpt && (
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
                    {post.excerpt}
                  </p>
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
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Posts</h1>
        <p className="text-muted-foreground">
          Everything I publish under <strong>web-blog</strong> in Notion.
        </p>
      </div>

      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}
