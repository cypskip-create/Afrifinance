import { query } from "./db.js";

export type DeadLetterStage = "fetch" | "parse" | "ocr" | "table_extract";

/**
 * Records a permanent failure — a URL that exhausted its retries (§21 of
 * the original spec: "record the exact reason"). Upserts on
 * (source_id, url, stage): the same URL failing repeatedly at the same
 * stage increments attempts and bumps last_failed rather than piling up
 * duplicate rows.
 */
export async function recordDeadLetter(params: {
  sourceId: string;
  url: string;
  stage: DeadLetterStage;
  reason: string;
}): Promise<void> {
  await query(
    `INSERT INTO scraping.dead_letters (source_id, url, stage, reason, attempts, first_failed, last_failed)
     VALUES ($1, $2, $3, $4, 1, now(), now())
     ON CONFLICT (source_id, url, stage) DO UPDATE SET
       reason = EXCLUDED.reason,
       attempts = scraping.dead_letters.attempts + 1,
       last_failed = now()`,
    [params.sourceId, params.url, params.stage, params.reason],
  );
}

export async function listDeadLetters(sourceId?: string, limit = 100): Promise<
  { id: number; sourceId: string; url: string; stage: string; reason: string; attempts: number; lastFailed: string }[]
> {
  const res = await query<{
    id: number;
    source_id: string;
    url: string;
    stage: string;
    reason: string;
    attempts: number;
    last_failed: string;
  }>(
    sourceId
      ? `SELECT * FROM scraping.dead_letters WHERE source_id = $1 ORDER BY last_failed DESC LIMIT $2`
      : `SELECT * FROM scraping.dead_letters ORDER BY last_failed DESC LIMIT $1`,
    sourceId ? [sourceId, limit] : [limit],
  );
  return res.rows.map((r) => ({
    id: r.id,
    sourceId: r.source_id,
    url: r.url,
    stage: r.stage,
    reason: r.reason,
    attempts: r.attempts,
    lastFailed: r.last_failed,
  }));
}