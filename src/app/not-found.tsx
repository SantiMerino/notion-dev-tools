import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="animate-reveal py-8">
      <p className="label">404</p>
      <h1 className="text-display text-fg mt-5 leading-10 font-medium tracking-[-0.02em]">
        Post not found
      </h1>
      <p className="text-muted mt-3">
        That post either moved or was never published.
      </p>
      <Link
        href="/"
        className="group bg-surface-hover text-small text-fg ring-line-strong hover:bg-line mt-8 inline-flex h-9 items-center gap-2 rounded-md px-3 font-medium ring-1 transition-colors ring-inset"
      >
        <ArrowLeft
          aria-hidden
          className="size-3.5 transition-transform group-hover:-translate-x-0.5"
        />
        Back to all posts
      </Link>
    </div>
  );
}
