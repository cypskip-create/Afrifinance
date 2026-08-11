/**
 * The live price pipeline: collect → normalize → validate → cache → store
 * → broadcast → audit-log. This runs once per poll tick (or per streamed
 * message, in live mode) for every active symbol on an exchange.
 */
import type { IExchangeAdapter } from "../../adapters/types.js";
import { priceCollector } from "../collectors/priceCollector.js";
import { normalizePrice } from "../../normalization/prices/normalizePrice.js";
import { validateBatch } from "../validators/validate.js";
import { QuoteSchema } from "../validators/schemas.js";
import { pricesRepository } from "../../storage/repositories/pricesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import { ingestionLogRepository } from "../../storage/repositories/ingestionLogRepository.js";
import { marketEventBus } from "../../streaming/pubsub.js";
import { checkPricePlausibility } from "../../monitoring/dataQuality.js";
import { logger } from "../../monitoring/logger.js";
import type { Quote } from "../../types/market.js";

export async function runPriceIngestion(adapter: IExchangeAdapter, symbols: string[] = []): Promise<void> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  const raw = await priceCollector.collectQuotes(adapter, symbols);
  const normalized = raw.map(normalizePrice);
  // zod's inferred type widens `exchange`/`status` etc. from our literal
  // union types back to `string` — validateBatch only tells us shape
  // validity, so we keep working with the original typed `Quote` objects
  // for anything that passed, rather than the zod-inferred shape.
  const { valid: validShapes, rejected } = validateBatch(QuoteSchema, normalized);
  rejected.forEach((r) => errors.push(`Quote rejected: ${JSON.stringify(r.issues)}`));
  const validSymbols = new Set(validShapes.map((v) => v.securityId));
  const valid = normalized.filter((q) => validSymbols.has(q.securityId));

  const plausible: Quote[] = [];
  for (const quote of valid) {
    const previous = await pricesRepository.getQuote(quote.securityId).catch(() => null);
    const check = checkPricePlausibility(quote, previous);
    if (!check.plausible) {
      errors.push(`Quote for ${quote.symbol} rejected: ${check.reason}`);
      continue;
    }
    plausible.push(quote);
  }

  if (plausible.length > 0) {
    await pricesRepository.upsertQuotesBatch(plausible);
    for (const q of plausible) {
      await cache.set(CacheKeys.quote(q.symbol), q, 10_000);
      marketEventBus.publishQuote(q);
    }
    await cache.del(CacheKeys.movers());
  }

  await ingestionLogRepository.log({
    exchange: adapter.exchange, dataset: "price",
    status: errors.length === 0 ? "success" : (plausible.length > 0 ? "partial" : "failed"),
    recordCount: plausible.length, errorCount: errors.length,
    startedAt, finishedAt: new Date().toISOString(),
    errors: errors.length ? errors.slice(0, 20) : undefined,
  });

  if (errors.length) logger.warn({ exchange: adapter.exchange, errorCount: errors.length }, "Price ingestion completed with errors");
}