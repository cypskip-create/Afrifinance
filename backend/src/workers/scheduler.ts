/**
 * Boot sequence for all background processing. Order matters:
 *   1. Reference data + fundamentals (securities/companies must exist
 *      before anything else can reference them via foreign key).
 *   2. Corporate actions + candle backfill (depend on securities existing).
 *   3. One synchronous price pass, so every symbol has a live quote.
 *   4. Research (ratios + AfriScore) computed for the whole universe, now
 *      that both fundamentals AND a price exist for every symbol — this is
 *      what makes the screener populated immediately instead of only for
 *      whichever symbols happen to get queried first.
 *   5. THEN start the recurring interval/cron workers for ongoing updates.
 */
import { runFinancialsSyncOnce, startFinancialsWorker } from "./financialsWorker.js";
import { runCorporateActionsSyncOnce, startCorporateActionsWorker } from "./corporateActionsWorker.js";
import { runCandlesBackfillOnce, startCandlesWorker } from "./candlesWorker.js";
import { runPriceIngestionOnce, startPriceWorker } from "./priceWorker.js";
import { researchService } from "../services/research/researchService.js";
import { ACTIVE_EXCHANGES } from "../config/index.js";
import { logger } from "../monitoring/logger.js";
import { getAllAdapters } from "../adapters/registry.js";
import { securitiesRepository } from "../storage/repositories/securitiesRepository.js";

async function bootstrapSecurities(): Promise<void> {
  for (const adapter of getAllAdapters()) {
    const securities = await adapter.listSecurities();
    for (const security of securities) {
      const sectorId = `${adapter.exchange.toLowerCase()}-unknown`;
      await securitiesRepository.upsertSector({ id: sectorId, name: "Unknown" });
      await securitiesRepository.upsertCompany({
        id: security.companyId,
        name: security.symbol,
        sectorId,
      });
      await securitiesRepository.upsertSecurity(security);
    }
    logger.info({ exchange: adapter.exchange, count: securities.length }, "Bootstrapped securities");
  }
}

export async function startAllWorkers(): Promise<() => void> {
  logger.info("Bootstrapping reference data + fundamentals…");
  await bootstrapSecurities();
  await runFinancialsSyncOnce();
  await runCorporateActionsSyncOnce();
  await runCandlesBackfillOnce();

  logger.info("Running first price pass so every symbol has a live quote…");
  // respectTradingCalendar: false — bootstrap needs at least one quote to
  // exist regardless of whether NSE happens to be open at deploy time
  // (e.g. deploying at night, or in mock mode where "trading hours" don't
  // reflect anything real anyway). The recurring interval below DOES
  // respect market hours.
  await runPriceIngestionOnce({ respectTradingCalendar: false });

  logger.info("Computing research (ratios + AfriScore) for the full universe…");
  for (const exchange of ACTIVE_EXCHANGES) {
    await researchService.recomputeAllForExchange(exchange);
  }

  const stopPriceWorker = startPriceWorker();
  const financialsTask = startFinancialsWorker();
  const corporateActionsTask = startCorporateActionsWorker();
  const candlesTask = startCandlesWorker();

  logger.info("All workers started");
  return () => {
    stopPriceWorker();
    financialsTask.stop();
    corporateActionsTask.stop();
    candlesTask.stop();
  };
}