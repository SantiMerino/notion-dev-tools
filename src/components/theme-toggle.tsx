"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useHotkey } from "@/hooks/use-hotkey";

/**
 * The portfolio's floating toggle, pinned to the top-right corner, with the
 * same `T` shortcut. Both icons always render and CSS picks one: reading the
 * theme during render would mismatch the prerendered HTML.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const toggle = () => setTheme(resolvedTheme === "light" ? "dark" : "light");

  useHotkey("t", toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      aria-keyshortcuts="T"
      className="bg-surface/80 text-muted ring-line hover:text-fg fixed top-6 right-6 z-50 inline-flex size-9 items-center justify-center rounded-full ring-1 backdrop-blur-md transition-colors ring-inset active:scale-[0.92] sm:top-8 sm:right-8"
    >
      <Moon className="light:scale-0 light:-rotate-60 light:opacity-0 size-4 transition-[transform,opacity] duration-300 ease-out-expo" />
      <Sun className="light:scale-100 light:rotate-0 light:opacity-100 absolute size-4 scale-60 rotate-60 opacity-0 transition-[transform,opacity] duration-300 ease-out-expo" />
    </button>
  );
}
