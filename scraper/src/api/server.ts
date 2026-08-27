import express, { Request, Response } from "express";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";
import { checkHealth } from "../monitoring/healthCheck.js";
import { listEnabledSources } from "../storage/sourcesRepository.js";

export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", async (_req: Request, res: Response) => {
    const health = await checkHealth();
    res.status(health.status === "ok" ? 200 : 503).json(health);
  });

  // Phase 0: read-only visibility into configured sources. Crawl-trigger
  // and job-status endpoints (§40) land in a later phase once there's an
  // actual crawler to trigger.
  app.get("/sources", async (_req: Request, res: Response) => {
    const sources = await listEnabledSources();
    res.json(sources);
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "not_found", path: req.path });
  });

  return app;
}

export function startServer() {
  const app = createServer();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Continua Scraper listening");
  });
}