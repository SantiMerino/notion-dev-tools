"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { isTyping, useHotkey } from "@/hooks/use-hotkey";
import { cn } from "@/lib/utils";

/** The home page's search box; `/` focuses it, from any page. */
export const SEARCH_INPUT_ID = "post-search";

/** Set before navigating home, so the search box takes focus once it mounts there. */
export const FOCUS_SEARCH_KEY = "santimh-focus-search";

const SHORTCUTS = [
  { keys: ["T"], label: "Switch theme" },
  { keys: ["/"], label: "Search posts" },
  { keys: ["H"], label: "All posts" },
  { keys: ["?"], label: "Open this note" },
] as const;

/**
 * The shortcuts that move around the blog. `T` lives with the theme toggle,
 * as on the portfolio.
 */
function useNavigationHotkeys() {
  const router = useRouter();

  useHotkey("/", () => {
    const search = document.getElementById(SEARCH_INPUT_ID);
    if (search) {
      search.focus();
      return;
    }
    try {
      sessionStorage.setItem(FOCUS_SEARCH_KEY, "1");
    } catch {
      // Storage blocked: the search box just won't take focus on arrival.
    }
    router.push("/");
  });

  useHotkey("h", () => {
    if (window.location.pathname === "/") window.scrollTo({ top: 0 });
    else router.push("/");
  });
}

/**
 * The portfolio's shortcuts note: a little card pinned beside the theme
 * toggle that lists the keyboard shortcuts. Opens on click or `?`, closes on
 * Escape, an outside click, or `?` again.
 */
export function ShortcutsNote() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useNavigationHotkeys();

  const show = useCallback((next: boolean) => {
    openRef.current = next;
    setOpen(next);
  }, []);

  // Focus goes back to the button only if it was inside the note — closing
  // shouldn't yank focus from wherever the visitor has tabbed to since.
  const close = useCallback(() => {
    if (panelRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    show(false);
  }, [show]);

  const toggle = useCallback(() => {
    if (openRef.current) close();
    else show(true);
  }, [close, show]);

  // `?` arrives as key "?" on most layouts, but as Shift + "/" from some
  // keyboards and automation — accept both. Never while typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "?" && !(event.key === "/" && event.shiftKey)) return;
      if (isTyping(event.target)) return;
      // Hidden on touch screens (e.g. a tablet with a keyboard attached) — don't open it unseen.
      if (buttonRef.current?.offsetParent === null) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      show(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close, show]);

  return (
    // Mouse/trackpad only: on touch there are no shortcuts to list, and the
    // extra fixed button would sit over the text while scrolling.
    <div className="pointer-fine:block fixed top-6 right-[68px] z-50 hidden sm:top-8 sm:right-[76px]">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Keyboard shortcuts"
        aria-keyshortcuts="?"
        className={cn(
          "bg-surface/80 text-muted ring-line hover:text-fg inline-flex h-9 items-center gap-2 rounded-md px-2.5 ring-1 backdrop-blur-md transition-[color,rotate,translate] duration-300 ease-out-expo ring-inset hover:translate-y-px hover:rotate-0",
          // A note pinned slightly askew, like the portfolio's; it squares up when used.
          open ? "rotate-0" : "-rotate-5 motion-reduce:rotate-0",
        )}
      >
        <kbd className="bg-surface-hover text-micro text-fg ring-line-strong inline-flex size-5 items-center justify-center rounded-sm font-mono ring-1 ring-inset">
          ?
        </kbd>
        <span className="label hidden text-inherit sm:inline">Keys</span>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "bg-surface shadow-float ring-line ease-out-expo absolute top-11 right-0 w-[260px] origin-top-right rounded-lg p-3 ring-1 duration-300 outline-none ring-inset",
          // Visibility flips at once on open (so the panel can take focus right
          // away) and only after the fade on close (so the fade is seen).
          open
            ? "visible translate-y-0 scale-100 rotate-0 opacity-100 transition-[opacity,scale,rotate,translate]"
            : "invisible -translate-y-1.5 scale-90 -rotate-4 opacity-0 transition-[opacity,scale,rotate,translate,visibility] motion-reduce:scale-100 motion-reduce:rotate-0",
        )}
      >
        <p className="label px-1 pb-2">Shortcuts</p>
        <ul className="space-y-0.5">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.label}
              className="text-ui text-muted flex items-center justify-between gap-3 rounded-md px-1 py-1.5"
            >
              {shortcut.label}
              <span className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="bg-surface-hover text-micro text-fg ring-line-strong inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono ring-1 ring-inset"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-line text-meta text-faint mt-2 border-t px-1 pt-2">
          Shortcuts pause while you type in a field.
        </p>
      </div>
    </div>
  );
}
