/**
 * Native text extraction for text-based PDFs (§5-6 of the original spec).
 * Deliberately does NOT attempt OCR — that's a separate, heavier pipeline
 * (Phase 5). A scanned PDF will come back here with near-zero extracted
 * text; this module's job is to detect that honestly (low confidence,
 * needsReview: true) rather than pretend the extraction succeeded.
 *
 * Table extraction (§6, Phase 3): pdf-parse v2's built-in `getTable()`
 * was tried first and returned empty results against multiple synthetic
 * test tables (bordered and borderless), so financial tables here come
 * from a text-based heuristic instead — see tableExtract.ts for details
 * and its documented limitations.
 */
import { PDFParse } from "pdf-parse";
import type { ParsedExtraction } from "../adapters/types.js";
import { logger } from "../monitoring/logger.js";
import { extractTablesFromText } from "./tableExtract.js";

export const PDF_PARSER_VERSION = "native-pdf-text-0.2.0";

// Below this many characters of extracted text, treat the PDF as
// effectively unextracted (scanned/image-based PDFs typically yield
// near-zero characters, not merely "few" — a short but genuine document,
// like a one-paragraph dividend notice, can legitimately land under 200
// chars, so the bar is set low enough to only catch the near-empty case).
const MIN_USABLE_TEXT_LENGTH = 50;

export async function extractPdfText(buffer: Buffer): Promise<Omit<ParsedExtraction, "entity">> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  let text = "";
  let pageCount = 0;

  try {
    // pdf.js' Node fake-worker path can throw DataCloneError when multiple
    // requests share the same MessageHandler concurrently. Keep calls
    // sequential; otherwise real NSE PDFs fail inside structuredClone().
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    text = textResult.text.trim();
    pageCount = infoResult.total;
  } catch (err) {
    logger.error({ err }, "PDF text extraction threw an exception");
    return {
      method: "native_pdf_text",
      confidence: 0,
      text: null,
      tables: [],
      needsReview: true,
    };
  } finally {
    await parser.destroy();
  }

  const looksUsable = text.length >= MIN_USABLE_TEXT_LENGTH;
  const avgCharsPerPage = pageCount > 0 ? text.length / pageCount : text.length;
  const confidence = !looksUsable ? 0.1 : Math.min(0.95, 0.5 + avgCharsPerPage / 4000);

  const tables = looksUsable ? extractTablesFromText(text) : [];

  return {
    method: "native_pdf_text",
    confidence,
    text: looksUsable ? text : text || null,
    tables,
    needsReview: !looksUsable,
  };
}