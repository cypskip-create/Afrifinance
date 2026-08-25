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

// 401/403/404 mean "this key/tier/resource will never work", not "the
// network hiccuped" — retrying changes nothing about the outcome, it just
// spends 2-3x the request quota to arrive at the identical failure. Duck
// -typed on `.status` (rather than importing e.g. MansaApiError) so this
// stays generic across every adapter's own error type, present or future.
// 429 (rate limited) is deliberately NOT in this list — that one can
// genuinely resolve itself after backing off.
const NON_RETRYABLE_STATUSES = new Set([401, 403, 404]);

function isNonRetryable(err: unknown): boolean {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" && NON_RETRYABLE_STATUSES.has(status);
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, baseDelayMs = 300, factor = 2, label = "operation" } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || isNonRetryable(err)) {
        if (attempt < retries) {
          logger.warn({ label, err: String(err) }, "Not retrying — error indicates a permanent auth/entitlement/not-found condition, not a transient one");
        }
        break;
      }
      const delay = baseDelayMs * Math.pow(factor, attempt);
      logger.warn({ label, attempt: attempt + 1, retries, delayMs: delay, err: String(err) }, "Retrying after failure");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}