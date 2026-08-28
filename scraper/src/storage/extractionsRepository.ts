import { query } from "./db.js";
import type { Extraction, ExtractionMethod } from "../types.js";

interface ExtractionSqlRow {
  id: number;
  artifact_id: number;
  method: ExtractionMethod;
  confidence: number | null;
  parser_version: string;
  text: string | null;
  tables: unknown[];
  entity: Record<string, unknown>;
  needs_review: boolean;
  extracted_at: string;
}

function mapRow(row: ExtractionSqlRow): Extraction {
  return {
    id: row.id,
    artifactId: row.artifact_id,
    method: row.method,
    confidence: row.confidence,
    parserVersion: row.parser_version,
    text: row.text,
    tables: row.tables,
    entity: row.entity,
    needsReview: row.needs_review,
    extractedAt: row.extracted_at,
  };
}

export interface NewExtraction {
  artifactId: number;
  method: ExtractionMethod;
  confidence: number | null;
  parserVersion: string;
  text: string | null;
  tables?: unknown[];
  entity?: Record<string, unknown>;
  needsReview: boolean;
}

/**
 * Always inserts a new row rather than updating in place — reprocessing
 * an artifact with a newer parser version (§45) should leave the old
 * extraction visible for comparison, not silently overwrite it.
 */
export async function insertExtraction(input: NewExtraction): Promise<Extraction> {
  const res = await query<ExtractionSqlRow>(
    `INSERT INTO scraping.extractions
       (artifact_id, method, confidence, parser_version, text, tables, entity, needs_review)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      input.artifactId,
      input.method,
      input.confidence,
      input.parserVersion,
      input.text,
      JSON.stringify(input.tables ?? []),
      JSON.stringify(input.entity ?? {}),
      input.needsReview,
    ],
  );
  const row = res.rows[0];
  if (!row) throw new Error(`insertExtraction: insert returned no row for artifact ${input.artifactId}`);
  return mapRow(row);
}

export async function findLatestExtraction(artifactId: number): Promise<Extraction | null> {
  const res = await query<ExtractionSqlRow>(
    `SELECT * FROM scraping.extractions WHERE artifact_id = $1 ORDER BY extracted_at DESC LIMIT 1`,
    [artifactId],
  );
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}