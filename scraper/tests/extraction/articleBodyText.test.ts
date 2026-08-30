import { describe, expect, it } from "vitest";
import { extractArticleBodyText } from "../../src/extraction/articleBodyText.js";

describe("extractArticleBodyText", () => {
  it("extracts text from an <article> tag, preferring it over the full body", () => {
    const html = `
      <html><body>
        <nav>Home | About | Contact</nav>
        <header>Site Header</header>
        <article>
          <h1>Real Article Title</h1>
          <p>This is the actual article content that matters.</p>
        </article>
        <footer>Copyright 2026</footer>
      </body></html>
    `;
    const text = extractArticleBodyText(html);
    expect(text).toContain("Real Article Title");
    expect(text).toContain("actual article content");
    expect(text).not.toContain("Home | About | Contact");
    expect(text).not.toContain("Copyright 2026");
  });

  it("falls back to <body> when there's no <article> tag", () => {
    const html = `<html><body><nav>Nav</nav><div class="content">Some content here</div></body></html>`;
    const text = extractArticleBodyText(html);
    expect(text).toContain("Some content here");
    expect(text).not.toContain("Nav");
  });

  it("removes script and style tags entirely", () => {
    const html = `
      <html><body>
        <article>
          <script>alert('should not appear');</script>
          <style>.foo { color: red; }</style>
          <p>Real content</p>
        </article>
      </body></html>
    `;
    const text = extractArticleBodyText(html);
    expect(text).toContain("Real content");
    expect(text).not.toContain("alert");
    expect(text).not.toContain("color: red");
  });
});