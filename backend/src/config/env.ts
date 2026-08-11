import "dotenv/config";
import { z } from "zod";

/**
 * Every environment variable the system needs, validated once at boot.
 * If something required is missing/malformed, we fail loudly at startup
 * instead of failing weirdly three layers deep at 2am during a price tick.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  WS_PORT: z.coerce.number().default(4001),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  CACHE_DRIVER: z.enum(["memory", "redis"]).default("memory"),
  REDIS_URL: z.string().optional(),

  NSE_CLIENT_MODE: z.enum(["mock", "live"]).default("mock"),
  NSE_API_BASE_URL: z.string().optional(),
  NSE_API_KEY: z.string().optional(),

  PRICE_POLL_INTERVAL_MS: z.coerce.number().default(5000),
  FINANCIALS_SYNC_CRON: z.string().default("0 2 * * *"),
  CORPORATE_ACTIONS_SYNC_CRON: z.string().default("0 3 * * *"),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();