import type { Request, Response } from "express";
import { historicalService } from "../../services/marketData/historicalService.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { CandleInterval } from "../../types/market.js";
import type { ExchangeCode } from "../../config/index.js";

const VALID_INTERVALS: CandleInterval[] = ["1m", "5m", "15m", "1h", "1d", "1w", "1M", "1y"];

export const historicalController = {
  async getCandles(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const interval = (req.query.interval as CandleInterval) || "1d";
    if (!VALID_INTERVALS.includes(interval)) throw new ApiError(400, `interval must be one of ${VALID_INTERVALS.join(", ")}`);
    const to = (req.query.to as string) || new Date().toISOString();
    const from = (req.query.from as string) || new Date(Date.now() - 90 * 86_400_000).toISOString();
    const candles = await historicalService.getCandles(exchange, symbol!.toUpperCase(), interval, from, to);
    res.json({ data: candles });
  },

  async getPerformance(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const to = (req.query.to as string) || new Date().toISOString();
    const from = req.query.from as string;
    if (!from) throw new ApiError(400, "from query param (ISO date) is required");
    const perf = await historicalService.getRangePerformance(exchange, symbol!.toUpperCase(), from, to);
    if (!perf) throw new ApiError(404, "No historical data available for that range");
    res.json({ data: perf });
  },
};