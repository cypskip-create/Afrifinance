import type { Request, Response } from "express";
import { z } from "zod";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { financialsRepository } from "../../storage/repositories/financialsRepository.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { FinancialsQuerySchema, FinancialsHistoryQuerySchema } from "../validators/querySchemas.js";

export const financialsController = {
  async getLatest(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange, periodType } = getQuery<z.infer<typeof FinancialsQuerySchema>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const latest = await financialsRepository.getLatestPeriodBundle(security.id, periodType);
    if (!latest) throw new ApiError(404, "No financials available yet");
    res.json({ data: latest });
  },

  async getHistory(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange, periodType, limit } = getQuery<z.infer<typeof FinancialsHistoryQuerySchema>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const history = await financialsRepository.getHistoricalPeriods(security.id, periodType, limit);
    res.json({ data: history });
  },
};