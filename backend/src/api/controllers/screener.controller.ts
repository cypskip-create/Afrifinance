import type { Request, Response } from "express";
import { screeningService, type ScreenerFilters } from "../../services/screening/screeningService.js";
import type { ExchangeCode } from "../../config/index.js";

export const screenerController = {
  async run(req: Request, res: Response) {
    const q = req.query;
    const filters: ScreenerFilters = {
      exchange: (q.exchange as ExchangeCode) || "NSE",
      sector: q.sector as string | undefined,
      minMarketCap: q.minMarketCap ? Number(q.minMarketCap) : undefined,
      maxPe: q.maxPe ? Number(q.maxPe) : undefined,
      minDividendYield: q.minDividendYield ? Number(q.minDividendYield) : undefined,
      minAfriScore: q.minAfriScore ? Number(q.minAfriScore) : undefined,
      sortBy: q.sortBy as ScreenerFilters["sortBy"],
      sortDirection: q.sortDirection as ScreenerFilters["sortDirection"],
      limit: q.limit ? Number(q.limit) : undefined,
    };
    const results = await screeningService.screen(filters);
    res.json({ data: results });
  },
};