import { query } from "./db.js";
import type { NewRawArtifact, RawArtifact } from "../types.js";

interface RawArtifactSqlRow {
  id: number;
  source_id: string;
  adapter: string;
  sha256: string;
  document_url: string;
  source_url: string | null;
  parent_url: string | null;
  content_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  title: string | null;
  published_at: string | null;
  discovered_at: string;
  retrieved_at: string;
  crawler_version: string;
  metadata: Record<string, unknown>;
}

function mapRow(row: RawArtifactSqlRow): RawArtifact {
  return {
    id: row.id,
    sourceId: row.source_id,
    adapter: row.adapter,
    sha256: row.sha256,
    documentUrl: row.document_url,
    sourceUrl: row.source_url,
    parentUrl: row.parent_url,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
    title: row.title,
    publishedAt: row.published_at,
    discoveredAt: row.discovered_at,
    retrievedAt: row.retrieved_at,
    crawlerVersion: row.crawler_version,
    metadata: row.metadata,
  };
}

export async function findBySha256(sourceId: string, sha256: string): Promise<RawArtifact | null> {
  const res = await query<RawArtifactSqlRow>(
    `SELECT * FROM scraping.raw_artifacts WHERE source_id = $1 AND sha256 = $2`,
    [sourceId, sha256],
  );
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}

export async function findById(id: number): Promise<RawArtifact | null> {
  const res = await query<RawArtifactSqlRow>(`SELECT * FROM scraping.raw_artifacts WHERE id = $1`, [id]);
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}

/**
 * Insert a new raw artifact, or return the existing one if this content
 * hash was already stored for this source (§17 — same PDF, no duplicate
 * processing). Callers should check the return's `isNew` flag before
 * kicking off extraction — reprocessing an unchanged artifact is wasted
 * work.
 */
export async function upsertArtifact(input: NewRawArtifact): Promise<{ artifact: RawArtifact; isNew: boolean }> {
  const existing = await findBySha256(input.sourceId, input.sha256);
  if (existing) {
    await recordArtifactUrl(existing.id, input.documentUrl);
    return { artifact: existing, isNew: false };
  }

  const res = await query<RawArtifactSqlRow>(
    `INSERT INTO scraping.raw_artifacts
       (source_id, adapter, sha256, document_url, source_url, parent_url, content_type, size_bytes,
        storage_path, title, published_at, crawler_version, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      input.sourceId,
      input.adapter,
      input.sha256,
      input.documentUrl,
      input.sourceUrl ?? null,
      input.parentUrl ?? null,
      input.contentType ?? null,
      input.sizeBytes ?? null,
      input.storagePath,
      input.title ?? null,
      input.publishedAt ?? null,
      input.crawlerVersion,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  const row = res.rows[0];
  if (!row) throw new Error(`upsertArtifact: insert returned no row for ${input.documentUrl}`);
  const artifact = mapRow(row);
  await recordArtifactUrl(artifact.id, input.documentUrl);
  return { artifact, isNew: true };
}

async function recordArtifactUrl(artifactId: number, url: string): Promise<void> {
  await query(
    `INSERT INTO scraping.artifact_urls (artifact_id, url) VALUES ($1, $2)
     ON CONFLICT (artifact_id, url) DO NOTHING`,
    [artifactId, url],
  );
}