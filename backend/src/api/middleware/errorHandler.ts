import type { Request, Response, NextFunction } from "express";
import { logger } from "../../monitoring/logger.js";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wraps an async route handler so thrown/rejected errors reach errorHandler
 *  instead of crashing the process — Express doesn't do this automatically
 *  for async handlers. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error({ err, path: req.path }, "Unhandled API error");
  res.status(500).json({ error: "Internal server error" });
}