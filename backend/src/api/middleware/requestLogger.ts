import type { Request, Response, NextFunction } from "express";
import { logger } from "../../monitoring/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({ method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }, "request");
  });
  next();
}