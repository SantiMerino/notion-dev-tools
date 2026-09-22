"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Notion's copy button and "Wrap" toggle live in its UI, not in the block the
 * API returns, so both are rebuilt here. Prompts (`plain text`) wrap; real code
 * keeps horizontal scroll so indentation stays intact.
 */
export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const wrap = language === "plain text";

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard is blocked (insecure context or denied permission); leave the text selectable.
    }
  }

  return (
    <div className="bg-muted relative overflow-hidden rounded-lg border">
      <div className="text-muted-foreground flex items-center justify-between border-b py-1.5 pr-2 pl-4 font-mono text-xs">
        <span>{language}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copiado" : "Copiar código"}
          className="hover:bg-background/60 hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre
        className={cn(
          "p-4 text-sm",
          wrap ? "break-words whitespace-pre-wrap" : "overflow-x-auto",
        )}
      >
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
