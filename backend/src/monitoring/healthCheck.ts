import { pool, query } from "../storage/db.js";
import { cache } from "../storage/cache.js";
import { logger } from "./logger.js";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, { ok: boolean; detail?: string }>;
  timestamp: string;
}

const STALE_QUOTE_MS = 15 * 60 * 1000; // matches dataQuality.ts's per-quote threshold

export async function runHealthCheck(): Promise<HealthStatus> {
  const checks: HealthStatus["checks"] = {};

  try {
    await pool.query("SELECT 1");
    checks.database = { ok: true };
  } catch (err) {
    checks.database = { ok: false, detail: String(err) };
  }

  try {
    await cache.set("healthcheck:ping", "pong", 5000);
    const val = await cache.get<string>("healthcheck:ping");
    checks.cache = { ok: val === "pong" };
  } catch (err) {
    checks.cache = { ok: false, detail: String(err) };
  }

  // Aggregate freshness across the WHOLE quote table, not just whatever a
  // client happened to request — this is what catches a stalled price
  // worker (feed down, crashed interval, etc.) before customers notice one
  // symbol at a time. Only meaningful once the DB check already passed.
  if (checks.database?.ok) {
    try {
      const res = await query<{ total: string; stale: string }>(
        `SELECT count(*) as total, count(*) FILTER (WHERE event_timestamp < now() - interval '${STALE_QUOTE_MS / 1000} seconds') as stale
         FROM market.live_quotes WHERE status = 'active'`
      );
      const total = Number(res.rows[0]?.total ?? 0);
      const stale = Number(res.rows[0]?.stale ?? 0);
      // Empty table (nothing bootstrapped yet) isn't a freshness problem —
      // only flag once there's data that SHOULD be fresh and isn't.
      const ok = total === 0 || stale === 0;
      checks.quoteFreshness = ok
        ? { ok: true }
        : { ok: false, detail: `${stale}/${total} active quotes are older than ${STALE_QUOTE_MS / 60000} minutes` };
    } catch (err) {
      checks.quoteFreshness = { ok: false, detail: String(err) };
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const status: HealthStatus["status"] = allOk ? "healthy" : (checks.database?.ok ? "degraded" : "unhealthy");
  if (!allOk) logger.error({ checks }, "Health check failed");

  return { status, checks, timestamp: new Date().toISOString() };
}