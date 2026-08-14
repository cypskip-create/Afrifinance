import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiRouter } from "./routes/index.js";
import { healthRoutes } from "./routes/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiKeyAuth } from "./middleware/apiKeyAuth.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";

// Requests are already gated behind an API key (see apiKeyAuth below), so an
// open CORS policy was never a data-access hole — but leaving `cors()` with
// no origin option means ANY website can drive this API straight from a
// visitor's browser using their own key. Locking Access-Control-Allow-Origin
// to our own frontend(s) closes that off. Non-browser callers (curl, the
// mobile app, server-to-server) don't send an Origin header at all and are
// unaffected — CORS is a browser-only mechanism.
const allowedOrigins = new Set(env.ALLOWED_ORIGINS);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    logger.warn({ origin }, "Blocked CORS request from disallowed origin");
    callback(new Error("Not allowed by CORS"));
  },
};

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors(corsOptions));
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