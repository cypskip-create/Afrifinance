/**
 * Keeps live_quotes fresh during market hours. Pull-based on a fixed
 * interval today (PRICE_POLL_INTERVAL_MS) — every tick runs the full
 * ingestion pipeline (normalize → validate → store → cache → broadcast →
 * audit-log) for every active symbol on every registered exchange, but
 * ONLY while that exchange's market is actually open (see
 * config/tradingCalendar.ts) — no point polling a closed market, and in
 * mock mode it avoids generating unrealistic overnight/weekend "trades".
 *
 * When a real licensed feed with a push/streaming endpoint is wired into
 * an adapter's `subscribeQuotes`, this can switch from setInterval to an
 * event-driven subscription without touching the pipeline itself — see the
 * commented alternative below.
 */
import { getAllAdapters } from "../adapters/registry.js";
import { securitiesRepository } from "../storage/repositories/securitiesRepository.js";
import { runPriceIngestion } from "../ingestion/pipelines/priceIngestionPipeline.js";
import { isMarketOpen } from "../config/tradingCalendar.js";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";

let intervalHandle: NodeJS.Timeout | null = null;

export interface RunOnceOptions {
  /** Bootstrap's one-time seed pass sets this false — it needs at least one
   *  quote to exist (for research to compute against) regardless of
   *  whether the market happens to be open at deploy time. The recurring
   *  interval leaves this true. */
  respectTradingCalendar?: boolean;
}

/** One full pass over every active symbol on every registered exchange.
 *  Exported separately from the interval loop so bootstrap can run it
 *  synchronously once (to populate live_quotes before anything downstream
 *  — like a first research computation — needs a price to work with). */
export async function runPriceIngestionOnce(options: RunOnceOptions = {}): Promise<void> {
  const { respectTradingCalendar = true } = options;
  for (const adapter of getAllAdapters()) {
    try {
      if (respectTradingCalendar && !isMarketOpen(adapter.exchange)) {
        logger.debug({ exchange: adapter.exchange }, "Market closed — skipping price ingestion tick");
        continue;
      }
      const securities = await securitiesRepository.listByExchange(adapter.exchange);
      if (securities.length === 0) continue; // not bootstrapped yet
      await runPriceIngestion(adapter, securities.map((s) => s.symbol));
    } catch (err) {
      logger.error({ err, exchange: adapter.exchange }, "Price ingestion pass failed");
    }
  }
}

export function startPriceWorker(): () => void {
  const adapters = getAllAdapters();
  logger.info({ exchanges: adapters.map((a) => a.exchange), intervalMs: env.PRICE_POLL_INTERVAL_MS }, "Starting price worker");

  intervalHandle = setInterval(() => { void runPriceIngestionOnce(); }, env.PRICE_POLL_INTERVAL_MS);

  return () => {
    if (intervalHandle) clearInterval(intervalHandle);
  };

  // ── Push-based alternative (once a real feed supports streaming) ──────
  // const unsubs = adapters.map((adapter) =>
  //   adapter.subscribeQuotes([], (quote) => {
  //     // still route through normalize/validate/store, just per-tick
  //     // instead of per-poll — see priceIngestionPipeline for the pieces.
  //   })
  // );
  // return () => unsubs.forEach((fn) => fn());
}

// Allows `npm run worker:price` to run this worker standalone.
if (import.meta.url === `file://${process.argv[1]}`) {
  startPriceWorker();
}