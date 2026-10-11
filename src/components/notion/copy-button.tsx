"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Status = "idle" | "copied" | "failed";

const LABELS: Record<Status, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Couldn't copy",
};

/**
 * Copies the `<code>` of the code block it sits in. The text is read from the
 * DOM at click time, so the code isn't serialized a second time as a prop.
 */
export function CopyButton() {
  const [status, setStatus] = useState<Status>("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(reset.current), []);

  function show(next: Status) {
    setStatus(next);
    // Restarted on every click, so a second copy holds the label its full time.
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setStatus("idle"), 1800);
  }

  async function copy(button: HTMLButtonElement) {
    const text = button
      .closest("[data-code-block]")
      ?.querySelector("code")?.textContent;
    try {
      if (text == null) throw new Error("No code to copy");
      await navigator.clipboard.writeText(text);
      show("copied");
    } catch {
      // Clipboard blocked (insecure context or denied permission): say so,
      // and the text is still there to select by hand.
      show("failed");
    }
  }

  const Icon = status === "copied" ? Check : status === "failed" ? X : Copy;

  return (
    <>
      <button
        type="button"
        onClick={(event) => copy(event.currentTarget)}
        className={cn(
          "text-ui hover:bg-surface-hover hover:text-fg inline-flex h-7 items-center gap-1.5 rounded-sm px-2 transition-colors",
          status === "copied" ? "text-accent" : "text-faint",
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {LABELS[status]}
      </button>
      {/* Announced once per result; a label swap on a focused button often isn't. */}
      <span role="status" className="sr-only">
        {status === "idle" ? "" : LABELS[status]}
      </span>
    </>
  );
}
