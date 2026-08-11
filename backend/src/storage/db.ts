/**
 * Single shared Postgres pool. AfriFinance Data writes into the `market`
 * schema of the SAME Postgres instance the app's Supabase project already
 * uses — one database, two schemas (`public` for the app, `market` for this
 * layer), so there's no cross-project sync to maintain. See
 * supabase/migrations/030_market_schema.sql for the DDL.
 */
import pg from "pg";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected Postgres pool error");
});

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params as any[]);
  const ms = Date.now() - start;
  if (ms > 500) logger.warn({ text, ms }, "Slow query");
  return res;
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}