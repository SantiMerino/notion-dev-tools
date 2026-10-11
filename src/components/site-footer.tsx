import type { ReactNode } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { GithubIcon, LinkedinIcon, PixelCursor } from "@/components/brand";
import { links, site } from "@/lib/site";

/**
 * The portfolio's footer, so leaving one site for the other doesn't feel like
 * a hand-off: brand and link columns on the sunken ground, then the wordmark
 * set huge and quiet on a hairline. `year` comes in from the layout, which
 * caches it (reading the clock here would break the static shell).
 */
export function SiteFooter({ year }: { year: ReactNode }) {
  const writing = [
    { label: "All posts", href: "/" },
    { label: "RSS feed", href: "/feed.xml" },
    { label: "JSON feed", href: "/feed.json" },
  ];
  const elsewhere = [
    { label: "Portfolio", href: site.portfolioUrl },
    { label: "GitHub", href: links.github },
    { label: "LinkedIn", href: links.linkedin },
    { label: "Email", href: `mailto:${site.email}` },
  ];

  return (
    <footer className="bg-sunken mt-24 overflow-hidden sm:mt-32">
      <div className="mx-auto grid w-full max-w-[960px] gap-12 px-6 pt-16 sm:pt-20 md:grid-cols-[1fr_1.7fr]">
        <div>
          <a
            href={site.portfolioUrl}
            className="text-fg inline-flex items-center gap-2.5 rounded-md"
          >
            <PixelCursor className="block h-auto w-3.5 drop-shadow-[0_2px_3px_rgb(0_0_0/0.25)]" />
            <span className="text-title leading-none font-medium tracking-tight">
              {site.handle}
            </span>
          </a>
          <p className="text-small text-muted mt-4 max-w-[300px] leading-6">
            {site.tagline}
          </p>
          <ul className="text-muted mt-7 flex items-center gap-4">
            <li>
              <a
                href={links.github}
                aria-label="GitHub"
                className="hover:text-fg transition-colors"
              >
                <GithubIcon className="size-[18px]" />
              </a>
            </li>
            <li>
              <a
                href={links.linkedin}
                aria-label="LinkedIn"
                className="hover:text-fg transition-colors"
              >
                <LinkedinIcon className="size-[18px]" />
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email"
                className="hover:text-fg transition-colors"
              >
                <Mail aria-hidden className="size-[18px]" />
              </a>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          <FooterColumn title="Writing">
            {writing.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fg transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Elsewhere">
            {elsewhere.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-fg transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Built with">
            <li>Notion API</li>
            <li>Next.js</li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="bg-accent size-2 shrink-0 rounded-full" />
              Synced live
            </li>
          </FooterColumn>

          <p className="text-ui text-muted col-span-full">
            © {year} {site.name}.
          </p>
        </div>
      </div>

      <Wordmark />
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-small text-fg font-medium">{title}</p>
      <ul className="text-small text-muted mt-4 flex flex-col gap-3">{children}</ul>
    </div>
  );
}

/** The portfolio's closing picture, minus the bird: the name, standing on a hairline. */
function Wordmark() {
  const W = 1200;
  const H = 300;
  const GROUND = 240;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className="mt-12 block h-auto w-full select-none sm:mt-16"
    >
      <text
        x={W / 2}
        y={GROUND}
        textAnchor="middle"
        fontSize="190"
        fontWeight="650"
        textLength="860"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fill: "var(--wordmark-fill)",
          stroke: "var(--wordmark-line)",
          strokeWidth: 1.2,
          fontFamily: "var(--font-sans)",
        }}
      >
        {site.handle}
      </text>
      <path d={`M40 ${GROUND} H1160`} stroke="var(--line-strong)" strokeWidth="1.2" />
    </svg>
  );
}
