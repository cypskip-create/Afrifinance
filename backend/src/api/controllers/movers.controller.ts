import type { Request, Response } from "express";
import { moversService } from "../../services/marketData/moversService.js";
import type { ExchangeCode } from "../../config/index.js";

export const moversController = {
  async getMovers(req: Request, res: Response) {
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const movers = await moversService.getTopMovers(exchange, limit);
    res.json({ data: movers });
  },
};