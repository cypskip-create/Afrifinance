/**
 * Extracts approximate body text from an article page. This is a basic
 * heuristic — strip obviously non-content tags (script, style, nav,
 * header, footer, aside, forms) and take what's left — NOT a true
 * boilerplate-removal algorithm (Mozilla's Readability, for comparison,
 * scores DOM nodes by text density and link ratio). Good enough to
 * capture "there is real article content here" and roughly how much,
 * not good enough to guarantee clean prose free of nav-adjacent cruft.
 * Flagged honestly via a capped confidence rather than pretending this
 * is equivalent to a proper content-extraction library.
 */
import * as cheerio from "cheerio";

export function extractArticleBodyText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, aside, form, iframe, noscript").remove();

  // Prefer <article> if present — most news sites use it and it's a much
  // stronger signal than falling back to <body>.
  const article = $("article");
  const root = article.length > 0 ? article : $("body");

  return root
    .text()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}