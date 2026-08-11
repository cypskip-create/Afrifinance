import { pricesRepository } from "../../storage/repositories/pricesRepository.js";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import type { Quote } from "../../types/market.js";
import type { ExchangeCode } from "../../config/index.js";

export const quoteService = {
  async getQuote(exchange: ExchangeCode, symbol: string): Promise<Quote | null> {
    return cache.getOrSet(CacheKeys.quote(symbol), 5_000, async () => {
      const security = await securitiesRepository.getBySymbol(exchange, symbol);
      if (!security) return null as any;
      return pricesRepository.getQuote(security.id);
    });
  },

  async getQuotesBatch(exchange: ExchangeCode, symbols: string[]): Promise<Quote[]> {
    return cache.getOrSet(CacheKeys.quotesBatch(symbols), 5_000, async () => {
      const securities = await Promise.all(symbols.map((s) => securitiesRepository.getBySymbol(exchange, s)));
      const ids = securities.filter((s): s is NonNullable<typeof s> => s !== null).map((s) => s.id);
      return pricesRepository.getQuotesBatch(ids);
    });
  },
};