import type { Request, Response } from "express";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { pricesRepository } from "../../storage/repositories/pricesRepository.js";
import { researchService } from "../../services/research/researchService.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { ExchangeCode } from "../../config/index.js";

export const researchController = {
  async getResearch(req: Request, res: Response) {
    const { symbol } = req.params;
    const exchange = (req.query.exchange as ExchangeCode) || "NSE";
    const upperSymbol = symbol!.toUpperCase();
    const security = await securitiesRepository.getBySymbol(exchange, upperSymbol);
    if (!security) throw new ApiError(404, `Unknown symbol ${symbol}`);

    let ratios = await cache.getOrSet(CacheKeys.ratios(upperSymbol), 60_000, () => researchService.getRatios(security.id));
    let score = await cache.getOrSet(CacheKeys.afriScore(upperSymbol), 60_000, () => researchService.getAfriScore(security.id));

    if (!ratios || !score) {
      const quote = await pricesRepository.getQuote(security.id);
      if (quote) {
        const recomputed = await researchService.recomputeAndStore(security.id, quote.lastPrice);
        if (recomputed) { ratios = recomputed.ratios; score = recomputed.score; }
      }
    }

    if (!ratios || !score) throw new ApiError(404, "Research data not available yet for this symbol");
    res.json({ data: { ratios, score } });
  },
};