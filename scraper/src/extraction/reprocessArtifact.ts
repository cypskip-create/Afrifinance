/**
 * Reprocessing (§45): re-run extraction against an already-stored
 * artifact using the CURRENT parser code, without re-downloading. Useful
 * after fixing a bug in extraction logic (exactly the kind of bug this
 * project has hit repeatedly — the pdf.js DataCloneError, the gzip
 * decompression issue, the table-heuristic false positives) — those
 * fixes only help documents crawled AFTER the fix unless there's a way
 * to reprocess what's already stored.
 *
 * Always inserts a NEW extraction row (insertExtraction never updates in
 * place — see that module's comment) so the old, buggy extraction stays
 * visible for comparison rather than silently vanishing.
 */
import { findById } from "../storage/rawArtifactsRepository.js";
import { readRawArtifact } from "../storage/rawStorage.js";
import { insertExtraction } from "../storage/extractionsRepository.js";
import { extractPdfText } from "./pdfText.js";
import { extractArticleBodyText } from "./articleBodyText.js";
import type { Extraction } from "../types.js";

const REPROCESS_RUNNER_VERSION = "reprocess-0.1.0";

export async function reprocessArtifact(artifactId: number): Promise<Extraction> {
  const artifact = await findById(artifactId);
  if (!artifact) throw new Error(`No raw_artifact found with id ${artifactId}`);

  const body = await readRawArtifact(artifact.storagePath);
  const contentType = artifact.contentType ?? "";

  if (contentType.includes("application/pdf")) {
    const result = await extractPdfText(body);
    return insertExtraction({
      artifactId,
      method: result.method,
      confidence: result.confidence,
      parserVersion: REPROCESS_RUNNER_VERSION,
      text: result.text,
      tables: result.tables,
      entity: {}, // reprocessing doesn't have the original discover()-time context (e.g. NSE's title-heuristic company name) — left unresolved rather than fabricated
      needsReview: result.needsReview,
    });
  }

  if (contentType.includes("text/html")) {
    const text = extractArticleBodyText(body.toString("utf-8"));
    const looksUsable = text.length >= 100;
    return insertExtraction({
      artifactId,
      method: "html",
      confidence: looksUsable ? 0.6 : 0.1,
      parserVersion: REPROCESS_RUNNER_VERSION,
      text: looksUsable ? text : null,
      tables: [],
      entity: {},
      needsReview: !looksUsable,
    });
  }

  throw new Error(`Reprocessing not supported for content type: ${artifact.contentType ?? "unknown"}`);
}