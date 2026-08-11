import { pool } from "../storage/db.js";
import { cache } from "../storage/cache.js";
import { logger } from "./logger.js";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, { ok: boolean; detail?: string }>;
  timestamp: string;
}

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

  const allOk = Object.values(checks).every((c) => c.ok);
  const status: HealthStatus["status"] = allOk ? "healthy" : (checks.database?.ok ? "degraded" : "unhealthy");
  if (!allOk) logger.error({ checks }, "Health check failed");

  return { status, checks, timestamp: new Date().toISOString() };
}