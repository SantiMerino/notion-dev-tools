import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

// globals.css maps Tailwind's font-sans to `--font-sans`, so the loaded font
// has to publish itself under that exact name.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s · Blog",
  },
  description: "Written in Notion, published here.",
};

// Reading the clock is non-deterministic, which Cache Components rejects
// during prerender. Caching it pins one value per build instead.
async function CurrentYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes sets the theme class on <html> before paint, which would
    // otherwise be flagged as a hydration mismatch.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
              <Link href="/" className="font-medium tracking-tight">
                Blog
              </Link>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground hidden text-sm sm:inline">
                  Powered by Notion
                </span>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
            {children}
          </main>

          <footer className="border-t">
            <div className="text-muted-foreground mx-auto w-full max-w-3xl px-6 py-6 text-sm">
              © <CurrentYear />
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
