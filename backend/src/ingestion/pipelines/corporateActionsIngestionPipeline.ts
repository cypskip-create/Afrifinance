/**
 * Corporate actions + earnings + ownership — all slow-moving, event-driven
 * datasets bundled into one daily pipeline (corporateActionsWorker.ts).
 * Corporate actions in particular need to flow into portfolio/yield/return
 * calculations elsewhere in the app, so storing them promptly matters even
 * though they don't change intraday.
 */
import type { IExchangeAdapter } from "../../adapters/types.js";
import { corporateActionsCollector } from "../collectors/corporateActionsCollector.js";
import { normalizeCorporateAction } from "../../normalization/corporateActions/normalizeCorporateAction.js";
import { corporateActionsRepository } from "../../storage/repositories/corporateActionsRepository.js";
import { ingestionLogRepository } from "../../storage/repositories/ingestionLogRepository.js";
import { marketEventBus } from "../../streaming/pubsub.js";
import { logger } from "../../monitoring/logger.js";

export async function runCorporateActionsIngestion(adapter: IExchangeAdapter, since: string, symbols: string[]): Promise<void> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let stored = 0;

  const [actions, earnings, ownership] = await Promise.all([
    corporateActionsCollector.collectActions(adapter, since),
    corporateActionsCollector.collectEarnings(adapter, since),
    corporateActionsCollector.collectOwnership(adapter, symbols),
  ]);

  for (const action of actions) {
    try {
      const normalized = normalizeCorporateAction(action);
      await corporateActionsRepository.upsertCorporateAction(normalized);
      marketEventBus.publishCorporateAction(normalized);
      stored++;
    } catch (err) {
      errors.push(`corporate action ${action.id}: ${String(err)}`);
    }
  }

  for (const event of earnings) {
    try {
      await corporateActionsRepository.upsertEarningsEvent(event);
      stored++;
    } catch (err) {
      errors.push(`earnings event ${event.id}: ${String(err)}`);
    }
  }

  if (ownership.length) {
    try {
      await corporateActionsRepository.upsertOwnership(ownership);
      stored += ownership.length;
    } catch (err) {
      errors.push(`ownership batch: ${String(err)}`);
    }
  }

  await ingestionLogRepository.log({
    exchange: adapter.exchange, dataset: "corporate_action",
    status: errors.length === 0 ? "success" : (stored > 0 ? "partial" : "failed"),
    recordCount: stored, errorCount: errors.length,
    startedAt, finishedAt: new Date().toISOString(),
    errors: errors.length ? errors.slice(0, 20) : undefined,
  });

  if (errors.length) logger.warn({ exchange: adapter.exchange, errorCount: errors.length }, "Corporate actions ingestion completed with errors");
}