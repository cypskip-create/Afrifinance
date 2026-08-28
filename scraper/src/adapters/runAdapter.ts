/**
 * Generic runner for any SourceAdapter — not just NSE. Ties discover()
 * -> fetch() -> parse() together and persists extractions. Kept separate
 * from crawler/crawlSource.ts because adapters don't use the crawl_state
 * queue (they discover their own full list of documents each run) — a
 * different, simpler execution shape than the generic link-following
 * crawler.
 */
import { insertExtraction } from "../storage/extractionsRepository.js";
import { logger } from "../monitoring/logger.js";
import type { SourceAdapter } from "./types.js";

export interface AdapterRunSummary {
  adapterId: string;
  discovered: number;
  fetched: number;
  newArtifacts: number;
  extracted: number;
  needsReview: number;
  failed: number;
}

export async function runAdapter(adapter: SourceAdapter): Promise<AdapterRunSummary> {
  const summary: AdapterRunSummary = {
    adapterId: adapter.id,
    discovered: 0,
    fetched: 0,
    newArtifacts: 0,
    extracted: 0,
    needsReview: 0,
    failed: 0,
  };

  const documents = await adapter.discover();
  summary.discovered = documents.length;

  for (const doc of documents) {
    try {
      const fetched = await adapter.fetch(doc);
      summary.fetched++;
      if (fetched.isNewArtifact) summary.newArtifacts++;

      // Only bother re-parsing artifacts we haven't seen before — an
      // unchanged PDF doesn't need re-extraction (§17, §44 — idempotent).
      if (!fetched.isNewArtifact) continue;

      if (!adapter.parse) continue;
      const parsed = await adapter.parse(fetched);
      await insertExtraction({
        artifactId: fetched.artifactId,
        method: parsed.method,
        confidence: parsed.confidence,
        parserVersion: "adapter-runner-0.1.0",
        text: parsed.text,
        tables: parsed.tables,
        entity: parsed.entity,
        needsReview: parsed.needsReview,
      });
      summary.extracted++;
      if (parsed.needsReview) summary.needsReview++;
    } catch (err) {
      logger.warn({ url: doc.url, err }, "Adapter run: document failed");
      summary.failed++;
    }
  }

  logger.info(summary, "Adapter run complete");
  return summary;
}