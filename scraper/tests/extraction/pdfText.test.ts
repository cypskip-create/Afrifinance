import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgres://user:pass@localhost:5432/continua_test";
process.env.LOG_LEVEL ??= "fatal";

const { extractPdfText } = await import("../../src/extraction/pdfText.js");

describe("extractPdfText", () => {
  it("extracts committed NSE PDFs without triggering pdf.js DataCloneError", async () => {
    const fixtureDir = join(process.cwd(), "data", "raw", "nse", "2026");
    const pdfs = readdirSync(fixtureDir).filter((file) => file.endsWith(".pdf"));

    expect(pdfs.length).toBeGreaterThan(0);

    const results = [];
    for (const pdf of pdfs) {
      const result = await extractPdfText(readFileSync(join(fixtureDir, pdf)));
      results.push(result);

      expect(result.method).toBe("native_pdf_text");
      // Phase 2 assumption (tables always empty) no longer holds as of
      // Phase 3's table heuristic — some of these real documents contain
      // genuine financial tables. Assert shape, not absence.
      expect(Array.isArray(result.tables)).toBe(true);
    }

    expect(results.some((result) => result.text && result.text.length >= 200)).toBe(true);
  });
});