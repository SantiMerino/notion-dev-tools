import { Suspense } from "react";

import { SearchablePosts } from "@/components/searchable-posts";
import { getSearchablePosts } from "@/lib/notion/posts";
import { site } from "@/lib/site";

async function PostList() {
  const posts = await getSearchablePosts();
  return <SearchablePosts posts={posts} />;
}

/** The search box, the lead card and two rail stops, in outline. */
function PostListSkeleton() {
  const bar = "animate-pulse rounded-sm bg-surface-hover";

  return (
    <div aria-busy="true">
      <div className="bg-surface ring-line h-10 rounded-md ring-1 ring-inset" />
      <div className="bg-surface ring-line mt-15 rounded-lg p-5 ring-1 ring-inset sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className={`h-3 w-16 ${bar}`} />
          <span className={`h-3 w-28 ${bar}`} />
        </div>
        <span className={`mt-7 block h-5 w-[68%] ${bar}`} />
        <span className={`mt-3.5 block h-3.5 w-full ${bar}`} />
        <span className={`mt-2.5 block h-3.5 w-[82%] ${bar}`} />
        <span className={`mt-8 block h-3 w-24 ${bar}`} />
      </div>
      <div className="mt-10 px-5 sm:px-6">
        <span className={`block h-3 w-28 ${bar}`} />
        <ol className="border-line mt-4 ml-[2.5px] border-l">
          {["64%", "48%"].map((width) => (
            <li key={width} className="relative pb-6 pl-6 last:pb-0">
              <span className="bg-bg ring-line-strong absolute top-[3px] -left-[5px] size-[9px] rounded-full ring-1" />
              <span className={`block h-3 w-6 ${bar}`} />
              <span className={`mt-3 block h-4 ${bar}`} style={{ width }} />
              <span className={`mt-2.5 block h-3 w-[88%] ${bar}`} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* The portfolio's section head: a mono label that is the real heading,
          then a line of muted prose under it. */}
      <h1 className="label animate-reveal">{site.title}</h1>
      <p
        className="text-muted animate-reveal mt-5"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {site.description}
      </p>

      <div className="mt-10">
        <Suspense fallback={<PostListSkeleton />}>
          <PostList />
        </Suspense>
      </div>
    </div>
  );
}
