import { Suspense } from "react";

import { SearchablePosts } from "@/components/searchable-posts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchablePosts } from "@/lib/notion/posts";

async function PostList() {
  const posts = await getSearchablePosts();
  return <SearchablePosts posts={posts} />;
}

function PostListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-full" />
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
