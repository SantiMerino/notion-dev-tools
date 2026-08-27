import { Suspense } from "react";

import { SearchablePosts } from "@/components/searchable-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchablePosts } from "@/lib/notion/posts";

async function PostList() {
  const posts = await getSearchablePosts();
  return <SearchablePosts posts={posts} />;
}

function PostListSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-40" />
      <div className="mt-8">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="border-border/70 grid gap-x-10 gap-y-2 border-b py-7 last:border-b-0 sm:grid-cols-[6.5rem_1fr]"
          >
            <Skeleton className="h-3 w-20 sm:mt-1.5" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="motion-safe:animate-rise space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Posts</h1>
        <p className="text-muted-foreground text-sm">
          Everything I publish under <strong>web-blog</strong> in Notion.
        </p>
      </div>

      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}
