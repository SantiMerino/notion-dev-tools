import { highlight } from "@/lib/highlight";
import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

/**
 * Notion's copy button and "Wrap" toggle live in its UI, not in the block the
 * API returns, so both are rebuilt here. Prompts (`plain text`) wrap; real code
 * keeps horizontal scroll so indentation stays intact.
 *
 * This stays a server component: the code is highlighted here and ships once,
 * as HTML. Only the copy button hydrates, and it reads the text back out of
 * the `<code>` below rather than receiving it as a prop.
 */
export async function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const wrap = language === "plain text";
  const lines = await highlight(code, language);

  return (
    <div
      data-code-block
      className="bg-surface ring-line overflow-hidden rounded-lg ring-1 ring-inset"
    >
      <div className="border-line flex items-center justify-between gap-4 border-b py-1.5 pr-1.5 pl-4">
        <span className="mono-xs text-faint lowercase">{language}</span>
        <CopyButton />
      </div>
      <pre
        className={cn(
          "text-ui p-4 leading-[22px]",
          wrap ? "break-words whitespace-pre-wrap" : "overflow-x-auto",
        )}
      >
        <code className="text-fg font-mono">
          {lines
            ? lines.map((line, index) => (
                <span key={index}>
                  {index > 0 ? "\n" : null}
                  {line.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      className="shiki-token"
                      style={token.htmlStyle}
                    >
                      {token.content}
                    </span>
                  ))}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}
