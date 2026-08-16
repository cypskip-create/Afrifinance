/**
 * Historical candle pipeline. Pulls daily OHLCV from the adapter, stores it,
 * then derives weekly/monthly/yearly candles from the daily series via the
 * aggregator rather than fetching each resolution separately — one fetch,
 * many stored resolutions. Backfills a long window once (bootstrap) and
 * tops up a short trailing window on a daily cron (idempotent upsert, so
 * re-fetching the last few days is cheap and self-healing if a prior run
 * partially failed).
 */
import type { IExchangeAdapter } from "../../adapters/types.js";
import { validateBatch } from "../validators/validate.js";
import { CandleSchema } from "../validators/schemas.js";
import { candlesRepository } from "../../storage/repositories/candlesRepository.js";
import { aggregateCandles } from "../../services/analytics/candleAggregator.js";
import { ingestionLogRepository } from "../../storage/repositories/ingestionLogRepository.js";
import { deadLetterRepository } from "../../storage/repositories/deadLetterRepository.js";
import { checkDuplicateCandle } from "../../monitoring/dataQuality.js";
import { withRetry } from "../retry.js";
import { logger } from "../../monitoring/logger.js";
import type { Candle } from "../../types/market.js";

export async function ingestDailyCandles(adapter: IExchangeAdapter, symbols: string[], days: number): Promise<void> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let stored = 0;
  let duplicatesDropped = 0;

  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);

  for (const symbol of symbols) {
    try {
      const raw = await withRetry(
        () => adapter.getCandles(symbol, "1d", from.toISOString(), to.toISOString()),
        { label: `${adapter.exchange}.getCandles(${symbol})` }
      );
      const { valid: validShapes, rejected } = validateBatch(CandleSchema, raw);
      rejected.forEach((r) => errors.push(`${symbol}: candle rejected: ${JSON.stringify(r.issues)}`));
      const validIds = new Set(validShapes.map((v) => `${v.securityId}:${v.timestamp}`));

      // A well-behaved feed shouldn't send the same bar twice in one
      // response, but a paginated/retried provider call sometimes does —
      // drop repeats before they hit an upsert (which would silently mask
      // it) so it's visible in the ingestion log instead.
      const seen = new Set<string>();
      const daily = raw.filter((c) => {
        if (!validIds.has(`${c.securityId}:${c.timestamp}`)) return false;
        if (checkDuplicateCandle(seen, `${c.securityId}:${c.interval}:${c.timestamp}`)) {
          duplicatesDropped++;
          return false;
        }
        return true;
      });

      if (daily.length === 0) continue;
      await candlesRepository.upsertCandlesBatch(daily);
      stored += daily.length;

      // Derive higher timeframes from the daily series we just fetched —
      // no separate adapter calls needed for weekly/monthly/yearly.
      const derived: Candle[] = [
        ...aggregateCandles(daily, "1w"),
        ...aggregateCandles(daily, "1M"),
        ...aggregateCandles(daily, "1y"),
      ];
      if (derived.length) {
        await candlesRepository.upsertCandlesBatch(derived);
        stored += derived.length;
      }
    } catch (err) {
      errors.push(`${symbol}: ${String(err)}`);
      await deadLetterRepository.record({
        exchange: adapter.exchange, dataset: "candle", symbol,
        payload: { symbol, days }, error: String(err),
      });
    }
  }

  await ingestionLogRepository.log({
    exchange: adapter.exchange, dataset: "candle",
    status: errors.length === 0 ? "success" : (stored > 0 ? "partial" : "failed"),
    recordCount: stored, errorCount: errors.length,
    startedAt, finishedAt: new Date().toISOString(),
    errors: errors.length ? errors.slice(0, 20) : undefined,
  });

  if (duplicatesDropped) logger.warn({ exchange: adapter.exchange, duplicatesDropped }, "Candle ingestion dropped duplicate bars");
  if (errors.length) logger.warn({ exchange: adapter.exchange, errorCount: errors.length }, "Candle ingestion completed with errors");
}