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

export async function startAllWorkers(): Promise<() => void> {
  logger.info("Bootstrapping reference data + fundamentals…");
  await runFinancialsSyncOnce();
  await runCorporateActionsSyncOnce();
  await runCandlesBackfillOnce();

  logger.info("Running first price pass so every symbol has a live quote…");
  await runPriceIngestionOnce();

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