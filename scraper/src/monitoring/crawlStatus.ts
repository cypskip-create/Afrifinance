/**
 * Aggregate operational overview (§29-30, §40's GET /crawl-status) —
 * how much has been crawled, what's stuck, what's failed, without
 * needing to write ad-hoc SQL every time. Read-only, safe to poll.
 */
import { query } from "../storage/db.js";

export interface CrawlStatusReport {
  sources: { id: string; name: string; enabled: boolean }[];
  crawlStateBySourceAndStatus: { sourceId: string; status: string; count: number }[];
  totalRawArtifacts: number;
  extractionsByMethod: { method: string; count: number }[];
  needsReviewCount: number;
  deadLetterCount: number;
}

export async function getCrawlStatus(): Promise<CrawlStatusReport> {
  const [sources, crawlState, artifactCount, extractionsByMethod, needsReview, deadLetters] = await Promise.all([
    query<{ id: string; name: string; enabled: boolean }>(`SELECT id, name, enabled FROM scraping.sources ORDER BY id`),
    query<{ source_id: string; status: string; count: string }>(
      `SELECT source_id, status, count(*) as count FROM scraping.crawl_state GROUP BY source_id, status ORDER BY source_id, status`,
    ),
    query<{ count: string }>(`SELECT count(*) as count FROM scraping.raw_artifacts`),
    query<{ method: string; count: string }>(
      `SELECT method, count(*) as count FROM scraping.extractions GROUP BY method ORDER BY method`,
    ),
    query<{ count: string }>(
      `SELECT count(*) as count FROM (
         SELECT DISTINCT ON (artifact_id) needs_review FROM scraping.extractions ORDER BY artifact_id, extracted_at DESC
       ) latest WHERE needs_review = true`,
    ),
    query<{ count: string }>(`SELECT count(*) as count FROM scraping.dead_letters`),
  ]);

  return {
    sources: sources.rows,
    crawlStateBySourceAndStatus: crawlState.rows.map((r) => ({ sourceId: r.source_id, status: r.status, count: Number(r.count) })),
    totalRawArtifacts: Number(artifactCount.rows[0]?.count ?? 0),
    extractionsByMethod: extractionsByMethod.rows.map((r) => ({ method: r.method, count: Number(r.count) })),
    needsReviewCount: Number(needsReview.rows[0]?.count ?? 0),
    deadLetterCount: Number(deadLetters.rows[0]?.count ?? 0),
  };
}