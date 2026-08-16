/**
 * Generic retry-with-backoff for anything that talks to an external
 * provider (an adapter's client calls). A single network hiccup shouldn't
 * turn into a dropped price tick or a skipped symbol in a fundamentals
 * sync — but retrying forever isn't right either, so this gives up after a
 * bounded number of attempts and lets the caller decide what "gave up"
 * means (log it, dead-letter it, skip the symbol for this run).
 */
import { logger } from "../monitoring/logger.js";

export interface RetryOptions {
  retries?: number;      // number of ATTEMPTS beyond the first, default 2 (3 total tries)
  baseDelayMs?: number;  // delay before the first retry, default 300ms
  factor?: number;       // exponential backoff multiplier, default 2
  label?: string;        // for log context
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, baseDelayMs = 300, factor = 2, label = "operation" } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(factor, attempt);
      logger.warn({ label, attempt: attempt + 1, retries, delayMs: delay, err: String(err) }, "Retrying after failure");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}