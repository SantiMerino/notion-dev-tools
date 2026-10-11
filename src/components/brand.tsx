import type { SVGProps } from "react";

/** The portfolio's mark: the classic arrow, pixel for pixel. B = outline, W = fill. */
const cursorPixels = [
  "B..........",
  "BB.........",
  "BWB........",
  "BWWB.......",
  "BWWWB......",
  "BWWWWB.....",
  "BWWWWWB....",
  "BWWWWWWB...",
  "BWWWWWWWB..",
  "BWWWWWWWWB.",
  "BWWWWWBBBBB",
  "BWWBWWB....",
  "BWB.BWWB...",
  "BB..BWWB...",
  "B....BWWB..",
  ".....BWWB..",
  "......BB...",
];

/** Same in both themes, like the portfolio's: the outline carries it on white. */
export function PixelCursor({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 11 17"
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {cursorPixels.flatMap((row, y) =>
        [...row].map((pixel, x) =>
          pixel === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={pixel === "B" ? "#0b0c0e" : "#ffffff"}
            />
          ),
        ),
      )}
    </svg>
  );
}

/** lucide-react v1 dropped brand marks, so the two we need live here. */
export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6a11.4 11.4 0 0 0 7.8-10.8C23.4 5.6 18.3.5 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21h-4V9Z" />
    </svg>
  );
}
