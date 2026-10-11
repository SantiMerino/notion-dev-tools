"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** True while the user is typing somewhere a key press means a character. */
export function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

/**
 * The portfolio's hotkey hook: binds a single-character shortcut. Keystrokes
 * aimed at form fields are ignored, so a shortcut never eats a typed letter.
 * Held keys don't repeat, and the listener binds once — the latest handler is
 * read from a ref, so inline handlers don't rebind it on every render.
 *
 * Letters match with or without Shift. A symbol doesn't: Shift turns `/` into
 * `?` on most layouts, and those are different shortcuts.
 */
export function useHotkey(key: string, handler: () => void) {
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const letter = /^[a-z]$/i.test(key);

    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (!letter && event.shiftKey) return;
      if (isTyping(event.target)) return;

      event.preventDefault();
      handlerRef.current();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key]);
}
