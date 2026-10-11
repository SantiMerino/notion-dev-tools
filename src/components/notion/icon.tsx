import type { NotionIcon } from "@/lib/notion/icons";
import { cn } from "@/lib/utils";

/**
 * A page or callout icon, decorative either way: the title next to it already
 * says what it is. `className` sizes it — font size for an emoji, box size
 * for an image (pass both).
 */
export function NotionIconView({
  icon,
  className,
}: {
  icon: NotionIcon;
  className?: string;
}) {
  if (icon.kind === "emoji") {
    return (
      <span aria-hidden className={cn("leading-none", className)}>
        {icon.emoji}
      </span>
    );
  }

  return (
    // A file icon 307s through the proxy to a signed URL and Notion gives no
    // dimensions, so next/image can't help here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon.url}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn("inline-block object-contain", className)}
    />
  );
}
