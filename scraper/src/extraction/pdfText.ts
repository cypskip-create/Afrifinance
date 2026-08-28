/**
 * Native text extraction for text-based PDFs (§5-6 of the original spec).
 * Deliberately does NOT attempt OCR — that's a separate, heavier pipeline
 * (Phase 5). A scanned PDF will come back here with near-zero extracted
 * text; this module's job is to detect that honestly (low confidence,
 * needsReview: true) rather than pretend the extraction succeeded.
 *
 * Table extraction (§6) is NOT implemented here — pdf-parse gives flat
 * text, not table structure. That's Phase 3. For now, financial tables
 * inside a PDF just come through as part of the plain text blob.
 */
import { PDFParse } from "pdf-parse";
import type { ParsedExtraction } from "../adapters/types.js";
import { logger } from "../monitoring/logger.js";

export const PDF_PARSER_VERSION = "native-pdf-text-0.1.0";

const MIN_USABLE_TEXT_LENGTH = 200;

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

  return {
    method: "native_pdf_text",
    confidence,
    text: looksUsable ? text : text || null,
    tables: [],
    needsReview: !looksUsable,
  };
}