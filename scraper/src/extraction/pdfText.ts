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

// Below this many characters of extracted text, treat the PDF as
// effectively unextracted (almost certainly scanned/image-based) rather
// than reporting a hollow "success".
const MIN_USABLE_TEXT_LENGTH = 200;

export async function extractPdfText(buffer: Buffer): Promise<Omit<ParsedExtraction, "entity">> {
  // Node.js Buffers can fail structuredClone/postMessage transfer in
  // Node 21+/22+ (see nodejs/node#55593) — pdfjs-dist's Node "fake
  // worker" relies on exactly that mechanism internally, and throws
  // DataCloneError on real-world PDFs (confirmed against actual NSE
  // documents, though not reproducible here with synthetic test PDFs).
  // Passing a plain, freshly-copied Uint8Array instead of the Buffer
  // avoids the issue entirely and costs nothing.
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  let text = "";
  let pageCount = 0;

  try {
    const [textResult, infoResult] = await Promise.all([parser.getText(), parser.getInfo()]);
    text = textResult.text.trim();
    pageCount = infoResult.total;
  } catch (err) {
    // Corrupted/invalid PDF (§21, §37) — flagged, not thrown, so a single
    // bad document doesn't take down a whole discover+fetch+parse run.
    // Logged in full because a silent catch here is exactly what hid the
    // httpClient decompression bug earlier — never repeat that mistake.
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

  // Confidence is a simple heuristic, not a real quality model: mostly
  // text length relative to page count, capped well below 1.0 since this
  // extractor has no way to verify correctness of what it pulled out.
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