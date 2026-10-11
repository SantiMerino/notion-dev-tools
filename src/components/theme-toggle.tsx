"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

/** True while the user is typing somewhere a letter key means a letter. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/**
 * The portfolio's floating toggle, pinned to the top-right corner, with the
 * same `T` shortcut. Both icons always render and CSS picks one: reading the
 * theme during render would mismatch the prerendered HTML.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const toggle = () => setTheme(resolvedTheme === "light" ? "dark" : "light");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "t" || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resolvedTheme, setTheme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      aria-keyshortcuts="T"
      title="Switch theme (T)"
      className="bg-surface/80 text-muted ring-line hover:text-fg fixed top-6 right-6 z-50 inline-flex size-9 items-center justify-center rounded-full ring-1 backdrop-blur-md transition-colors ring-inset active:scale-[0.92] sm:top-8 sm:right-8"
    >
      <Moon className="light:scale-0 light:-rotate-60 light:opacity-0 size-4 transition-[transform,opacity] duration-300 ease-out-expo" />
      <Sun className="light:scale-100 light:rotate-0 light:opacity-100 absolute size-4 scale-60 rotate-60 opacity-0 transition-[transform,opacity] duration-300 ease-out-expo" />
    </button>
  );
}
