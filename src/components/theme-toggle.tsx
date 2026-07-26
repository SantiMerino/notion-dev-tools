"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons always render and CSS decides which is visible. Reading the
          theme during render instead would mismatch the prerendered HTML. */}
      <Sun className="size-5 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
