import type { Request, Response } from "express";
import { runHealthCheck } from "../../monitoring/healthCheck.js";

export const healthController = {
  async check(_req: Request, res: Response) {
    const health = await runHealthCheck();
    res.status(health.status === "unhealthy" ? 503 : 200).json(health);
  },
};