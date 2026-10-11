import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's default type scale, so it would read
 * the custom sizes in globals.css (`text-ui`, `text-meta`, ...) as colours
 * and drop one whenever a real colour sits next to it: `cn("text-ui",
 * "text-faint")` would lose the size. Registering the scale fixes that.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "micro",
        "meta",
        "ui",
        "small",
        "body",
        "lead",
        "title",
        "heading",
        "display",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
