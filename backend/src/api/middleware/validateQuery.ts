import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "./errorHandler.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
    }
  }
}

/** Parses req.query against a schema and stores the typed, defaulted result
 *  on req.validatedQuery — controllers read it via getQuery<T>(req) instead
 *  of re-deriving/re-checking values from the raw query object themselves. */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const detail = result.error.issues.map((i) => `${i.path.join(".") || "query"}: ${i.message}`).join("; ");
      return next(new ApiError(400, `Invalid query parameters — ${detail}`));
    }
    req.validatedQuery = result.data;
    next();
  };
}

export function getQuery<T>(req: Request): T {
  return req.validatedQuery as T;
}