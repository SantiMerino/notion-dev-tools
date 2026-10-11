"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/notion/headings";
import { cn } from "@/lib/utils";

/** How far below the viewport's top a heading counts as the one being read. */
const READING_LINE = 120;

/** Index of the last heading that has scrolled past the reading line, or -1 above the first. */
function currentIndex(headings: Heading[]): number {
  let current = -1;
  for (let i = 0; i < headings.length; i++) {
    const el = document.getElementById(headings[i].id);
    if (el && el.getBoundingClientRect().top <= READING_LINE) current = i;
  }
  return current;
}

/**
 * The portfolio's section nav, for a post's headings: a dash per heading on
 * the right edge, the current one longer and brighter. Hover or tab into it
 * and the dashes open into the heading names. Wide screens only, where
 * there's a margin to put it in.
 */
export function PostToc({ headings }: { headings: Heading[] }) {
  const [current, setCurrent] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(currentIndex(headings)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  return (
    <nav
      aria-label="On this page"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 lg:block"
    >
      {/* The dashes. They stay put under the panel, so the hover target doesn't move. */}
      <ol
        aria-hidden
        className={cn(
          "flex flex-col items-end gap-2.5 py-3 pl-6 transition-opacity duration-200",
          open && "opacity-0",
        )}
      >
        {headings.map((heading, i) => (
          <li
            key={heading.id}
            className={cn(
              "ease-out-expo h-[2px] rounded-full transition-[width,background-color] duration-300",
              i === current
                ? "bg-fg w-5"
                : heading.level === 3
                  ? "bg-line-strong w-2"
                  : "bg-line-strong w-3",
            )}
          />
        ))}
      </ol>

      {/* Always in the DOM, so a keyboard can tab into it; focus is what opens it. */}
      <ol
        className={cn(
          "bg-surface shadow-float ring-line ease-out-expo absolute top-1/2 right-0 max-h-[70vh] w-60 origin-right -translate-y-1/2 overflow-y-auto rounded-lg p-1.5 ring-1 transition-[opacity,transform] duration-200 ring-inset",
          open
            ? "translate-x-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-2 scale-[0.97] opacity-0",
        )}
      >
        {headings.map((heading, i) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={i === current ? "location" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "text-ui hover:bg-surface-hover flex min-h-8 items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 transition-colors",
                heading.level === 3 && "pl-5",
                i === current ? "text-fg font-medium" : "text-muted hover:text-fg",
              )}
            >
              <span className="line-clamp-2">{heading.text}</span>
              <span
                aria-hidden
                className={cn(
                  "h-[2px] shrink-0 rounded-full",
                  i === current ? "bg-fg w-4" : "bg-line-strong w-2.5",
                )}
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
