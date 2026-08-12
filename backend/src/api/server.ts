import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiRouter } from "./routes/index.js";
import { healthRoutes } from "./routes/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiKeyAuth } from "./middleware/apiKeyAuth.js";
import { apiRateLimit } from "./middleware/rateLimit.js";

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Health stays open and unmetered — infra probes shouldn't need a key or
  // count against anyone's rate limit.
  app.use("/api/v1", healthRoutes);

  app.use("/api/v1", apiKeyAuth(), apiRateLimit(), apiRouter);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);

  return app;
}