/**
 * The ONLY file in the whole system that should know Mansa's base URL,
 * auth header, or endpoint paths — same rule as adapters/nse/nseClient.ts.
 * Generic across every exchange Mansa covers: every method takes an
 * exchange code, so one MansaClient instance serves NSE, NGX, JSE, GSE,
 * LuSE, DSE, BRVM, and anything else added to ACTIVE_EXCHANGES later.
 *
 * Free tier is 100 requests/day; several endpoints below are gated to
 * Starter/Pro/Premium tiers at Mansa's end (noted per-method). A request
 * against an endpoint your key's tier doesn't include comes back as a
 * normal HTTP error, which surfaces through MansaApiError like any other
 * failure — callers (the mapper/adapter layer) decide whether that's fatal
 * or something to degrade gracefully around (see mansaAdapter.ts).
 */
import { env } from "../../config/index.js";
import { logger } from "../../monitoring/logger.js";
import type {
  MansaStockListResponse, MansaStockDetailResponse, MansaHistoryResponse,
  MansaFundamentalsResponse, MansaDividendsResponse, MansaExchangeMetadataResponse,
  MansaIndexListResponse,
} from "./mansaRawTypes.js";

export class MansaApiError extends Error {
  constructor(public status: number, message: string, public path: string) {
    super(`Mansa API ${status} on ${path}: ${message}`);
  }
}

/** Mansa's example error payloads aren't fully documented; be liberal in
 *  what we accept when trying to extract a human-readable message. */
async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return body?.error ?? body?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

// Mansa's free-tier daily quota (100 requests/day, confirmed resetting at
// UTC midnight) is tied to the API KEY, not to any one exchange or
// endpoint — a 429 from an NSE quote call means an NGX candle call would
// fail identically right now too, since they draw from the same budget.
// This guard therefore lives here, in the ONE function every Mansa request
// of every kind funnels through, rather than being duplicated per-adapter
// or per-method. Once tripped, every call (any exchange, any endpoint)
// fails fast with a synthetic 429 — no network request sent at all — until
// the next UTC midnight. Without this, callers like getQuotes() that use
// Promise.allSettled internally never throw even when every symbol comes
// back 429, so withRetry's "don't retry a 429" rule never even gets a
// chance to apply — every polling tick would keep firing a full batch of
// real requests at an already-exhausted key, forever, which is exactly
// what was happening before this existed.
const QUOTA_RESET_BUFFER_MS = 2 * 60 * 1000; // small buffer for clock skew around the reset instant
let quotaExhaustedUntil: number | null = null;

function msUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextMidnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
  return nextMidnightUtc - now.getTime() + QUOTA_RESET_BUFFER_MS;
}

async function mansaFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  if (!env.MANSA_API_KEY) {
    throw new Error("MANSA_API_KEY is not set. Required whenever ADAPTER_MODE=live.");
  }

  if (quotaExhaustedUntil !== null) {
    if (Date.now() < quotaExhaustedUntil) {
      throw new MansaApiError(429, "Daily quota exhausted — cached, no request sent", path);
    }
    quotaExhaustedUntil = null; // cooldown lapsed — let this one through to check for real
  }

  const url = new URL(path, env.MANSA_API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${env.MANSA_API_KEY}` },
  });

  if (!res.ok) {
    if (res.status === 429) {
      quotaExhaustedUntil = Date.now() + msUntilNextUtcMidnight();
      logger.warn(
        { path, blockedUntil: new Date(quotaExhaustedUntil).toISOString() },
        "Mansa returned 429 — daily quota exhausted. Pausing ALL Mansa requests, every exchange and endpoint, until the next UTC midnight reset."
      );
    }
    throw new MansaApiError(res.status, await parseErrorMessage(res), path);
  }

  return (await res.json()) as T;
}

export interface IMansaClient {
  fetchStocks(exchange: string, opts?: { limit?: number; offset?: number; sector?: string }): Promise<MansaStockListResponse>;
  fetchStock(exchange: string, ticker: string): Promise<MansaStockDetailResponse>;
  /** Daily OHLCV only — Mansa has no intraday history endpoint. Pro tier+. */
  fetchHistory(exchange: string, ticker: string, opts: { from?: string; to?: string; range?: string }): Promise<MansaHistoryResponse>;
  /** Starter tier+. */
  fetchFundamentals(exchange: string, ticker: string): Promise<MansaFundamentalsResponse>;
  /** NGX only, Premium tier. Throws MansaApiError for any other exchange
   *  or an unentitled key — the adapter treats that as "no data available"
   *  rather than propagating the error, since most exchanges genuinely
   *  don't have this endpoint. */
  fetchDividends(exchange: string, ticker: string): Promise<MansaDividendsResponse>;
  fetchExchangeMetadata(): Promise<MansaExchangeMetadataResponse>;
  fetchIndices(exchange: string): Promise<MansaIndexListResponse>;
}

export class MansaClient implements IMansaClient {
  fetchStocks(exchange: string, opts: { limit?: number; offset?: number; sector?: string } = {}) {
    return mansaFetch<MansaStockListResponse>(`/api/v1/markets/exchanges/${exchange}/stocks`, {
      limit: opts.limit ?? 200,
      offset: opts.offset,
      sector: opts.sector,
    });
  }

  fetchStock(exchange: string, ticker: string) {
    return mansaFetch<MansaStockDetailResponse>(`/api/v1/markets/exchanges/${exchange}/stocks/${ticker}`);
  }

  fetchHistory(exchange: string, ticker: string, opts: { from?: string; to?: string; range?: string }) {
    return mansaFetch<MansaHistoryResponse>(`/api/v1/markets/exchanges/${exchange}/stocks/${ticker}/history`, {
      from: opts.from,
      to: opts.to,
      range: opts.from || opts.to ? undefined : opts.range ?? "1Y",
      order: "asc",
    });
  }

  fetchFundamentals(exchange: string, ticker: string) {
    return mansaFetch<MansaFundamentalsResponse>(`/api/v1/fundamentals/${exchange}/${ticker}`);
  }

  fetchDividends(exchange: string, ticker: string) {
    return mansaFetch<MansaDividendsResponse>(`/api/v1/markets/exchanges/${exchange}/dividends/${ticker}`);
  }

  fetchExchangeMetadata() {
    return mansaFetch<MansaExchangeMetadataResponse>("/api/v1/markets/exchange-metadata");
  }

  fetchIndices(exchange: string) {
    return mansaFetch<MansaIndexListResponse>(`/api/v1/markets/exchanges/${exchange}/indices`);
  }
}