import type { Request, Response } from "express";
import { z } from "zod";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { ExchangeQuery } from "../validators/querySchemas.js";

/** Lists the full tradable-instrument universe for an exchange. Exists so a
 *  frontend can build its symbol list (watchlist pickers, "all stocks"
 *  pages, screener sector filters) from the Data Layer instead of a
 *  hand-maintained local array that silently drifts out of sync with what
 *  the backend actually has data for. */
export const instrumentsController = {
  async list(req: Request, res: Response) {
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const instruments = await cache.getOrSet(
      CacheKeys.instruments(exchange),
      300_000,
      () => securitiesRepository.listInstruments(exchange)
    );
    res.json({ data: instruments });
  },
};