import type { Request, Response } from "express";
import { z } from "zod";
import { screeningService, type ScreenerFilters } from "../../services/screening/screeningService.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { ScreenerQuerySchema } from "../validators/querySchemas.js";

export const screenerController = {
  async run(req: Request, res: Response) {
    const q = getQuery<z.infer<typeof ScreenerQuerySchema>>(req);
    const filters: ScreenerFilters = {
      exchange: q.exchange,
      sector: q.sector,
      minMarketCap: q.minMarketCap,
      maxPe: q.maxPe,
      minDividendYield: q.minDividendYield,
      minAfriScore: q.minAfriScore,
      sortBy: q.sortBy,
      sortDirection: q.sortDirection,
      limit: q.limit,
    };
    const results = await screeningService.screen(filters);
    res.json({ data: results });
  },
};