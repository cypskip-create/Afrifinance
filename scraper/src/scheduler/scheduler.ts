/**
 * Real scheduling (§19): each enabled source runs on its own cron
 * expression, not one hardcoded global interval. A source with an
 * adapter registered in adapters/registry.ts runs via that adapter's
 * discover->fetch->parse pipeline; anything else falls back to the
 * generic crawler (crawler/crawlSource.ts).
 *
 * Node-cron, not a distributed job queue — this service runs as a single
 * instance (see rateLimiter.ts's header comment for the same tradeoff).
 * Revisit if this ever needs to run as multiple replicas.
 */
import cron, { type ScheduledTask } from "node-cron";
import { listEnabledSources } from "../storage/sourcesRepository.js";
import { crawlSource } from "../crawler/crawlSource.js";
import { hasRegisteredAdapter, runRegisteredAdapter } from "../adapters/registry.js";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";
import type { Source } from "../types.js";

const scheduledTasks: ScheduledTask[] = [];

async function runSourceOnce(source: Source): Promise<void> {
  try {
    if (hasRegisteredAdapter(source.adapter)) {
      const summary = await runRegisteredAdapter(source);
      logger.info({ sourceId: source.id, ...summary }, "Scheduled adapter run complete");
    } else {
      const summary = await crawlSource(source.id);
      logger.info(summary, "Scheduled crawl complete");
    }
  } catch (err) {
    logger.error({ sourceId: source.id, err }, "Scheduled run failed");
  }
}

/**
 * Loads all enabled sources and schedules each on its own cron
 * expression. Call once at service startup. Returns the list of
 * scheduled tasks so they can be stopped (e.g. in tests or graceful
 * shutdown) — node-cron has no global "stop everything" method.
 */
export async function startScheduler(): Promise<ScheduledTask[]> {
  if (!env.SCHEDULER_ENABLED) {
    logger.info("Scheduler disabled via SCHEDULER_ENABLED=false");
    return [];
  }

  const sources = await listEnabledSources();
  for (const source of sources) {
    const cronExpression = source.config.schedule ?? env.DEFAULT_CRAWL_CRON;

    if (!cron.validate(cronExpression)) {
      logger.warn({ sourceId: source.id, cronExpression }, "Invalid cron expression for source — skipping schedule");
      continue;
    }

    const task = cron.schedule(cronExpression, () => {
      void runSourceOnce(source);
    });
    scheduledTasks.push(task);
    logger.info({ sourceId: source.id, adapter: source.adapter, cronExpression }, "Scheduled source");
  }

  return scheduledTasks;
}

export function stopScheduler(): void {
  for (const task of scheduledTasks) task.stop();
  scheduledTasks.length = 0;
}