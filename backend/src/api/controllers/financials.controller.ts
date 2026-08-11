import type { Request, Response } from "express";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { financialsRepository } from "../../storage/repositories/financialsRepository.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { ExchangeCode } from "../../config/index.js";

export const financialsController = {
  async getLatest(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const periodType = (req.query.periodType as "annual" | "quarterly") || "annual";
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const latest = await financialsRepository.getLatestPeriodBundle(security.id, periodType);
    if (!latest) throw new ApiError(404, "No financials available yet");
    res.json({ data: latest });
  },

  async getHistory(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const periodType = (req.query.periodType as "annual" | "quarterly") || "annual";
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const security = await securitiesRepository.getBySymbol(exchange, symbol!.toUpperCase());
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);
    const history = await financialsRepository.getHistoricalPeriods(security.id, periodType, limit);
    res.json({ data: history });
  },
};