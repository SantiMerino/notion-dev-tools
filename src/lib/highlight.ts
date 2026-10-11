import {
  bundledLanguages,
  createHighlighter,
  createJavaScriptRegexEngine,
  type BundledLanguage,
  type Highlighter,
  type ThemedToken,
} from "shiki";

/**
 * Both themes go into every token as CSS variables (`--shiki-light`,
 * `--shiki-dark`) and globals.css picks one per `data-theme`, so code is
 * highlighted once, on the server, and a theme switch just recolours it.
 */
const THEMES = {
  light: "github-light-default",
  dark: "github-dark-default",
} as const;

/** Notion's names for the languages Shiki knows under another one. */
const NOTION_TO_SHIKI: Record<string, string> = {
  "java/c/c++/c#": "java",
  "vb.net": "vb",
  "visual basic": "vb",
  basic: "vb",
  flow: "javascript",
  fortran: "fortran-free-form",
  markup: "html",
  webassembly: "wasm",
};

// One highlighter for the process, languages loaded as posts ask for them.
// The JavaScript regex engine avoids shipping Oniguruma's WebAssembly.
let highlighter: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: Object.values(THEMES),
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/**
 * Tokens for a Notion code block, one array per line, or null when it should
 * render as plain text: `plain text` itself, a language Shiki doesn't have,
 * or a grammar that fails to load.
 */
export async function highlight(
  code: string,
  notionLanguage: string,
): Promise<ThemedToken[][] | null> {
  const lang = NOTION_TO_SHIKI[notionLanguage] ?? notionLanguage;
  if (!(lang in bundledLanguages)) return null;

  try {
    const instance = await getHighlighter();
    await instance.loadLanguage(lang as BundledLanguage);
    return instance.codeToTokens(code, {
      lang: lang as BundledLanguage,
      themes: THEMES,
      defaultColor: false,
    }).tokens;
  } catch {
    return null;
  }
}
