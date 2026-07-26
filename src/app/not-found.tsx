import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Post not found</h1>
      <p className="text-muted-foreground">
        That post either moved or was never published.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to all posts</Link>
      </Button>
    </div>
  );
}
