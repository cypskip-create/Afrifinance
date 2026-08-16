import type { Request, Response } from "express";
import { z } from "zod";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { corporateActionsRepository } from "../../storage/repositories/corporateActionsRepository.js";
import { ApiError } from "../middleware/errorHandler.js";
import { getQuery } from "../middleware/validateQuery.js";
import type { ExchangeQuery } from "../validators/querySchemas.js";

export const corporateActionsController = {
  async getForSymbol(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const actions = await corporateActionsRepository.getBySecurity(security.id);
    res.json({ data: actions });
  },

  async getDividends(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const dividends = await corporateActionsRepository.getDividendsBySecurity(security.id);
    res.json({ data: dividends });
  },

  async getOwnership(req: Request, res: Response) {
    const { symbol } = req.params;
    const { exchange } = getQuery<z.infer<typeof ExchangeQuery>>(req);
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const ownership = await corporateActionsRepository.getOwnership(security.id);
    res.json({ data: ownership });
  },
};