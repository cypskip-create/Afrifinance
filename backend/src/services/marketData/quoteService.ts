import { pricesRepository } from "../../storage/repositories/pricesRepository.js";
import { securitiesRepository } from "../../storage/repositories/securitiesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import { checkQuoteFreshness } from "../../monitoring/dataQuality.js";
import type { Quote } from "../../types/market.js";
import type { ExchangeCode } from "../../config/index.js";

/** Runs the freshness check on every quote actually handed to a caller —
 *  including cache hits, since staleness is about wall-clock distance from
 *  the quote's own event_timestamp, not about when it entered the cache.
 *  This is what would surface a stalled price worker: quotes keep getting
 *  served, but checkQuoteFreshness starts logging warnings for all of them. */
function withFreshnessCheck(quote: Quote | null): Quote | null {
  if (quote) checkQuoteFreshness(quote);
  return quote;
}

export const quoteService = {
  async getQuote(exchange: ExchangeCode, symbol: string): Promise<Quote | null> {
    const quote = await cache.getOrSet(CacheKeys.quote(symbol), 5_000, async () => {
      const security = await securitiesRepository.getBySymbol(exchange, symbol);
      if (!security) return null as any;
      return pricesRepository.getQuote(security.id);
    });
    return withFreshnessCheck(quote);
  },

  async getQuotesBatch(exchange: ExchangeCode, symbols: string[]): Promise<Quote[]> {
    const quotes = await cache.getOrSet(CacheKeys.quotesBatch(symbols), 5_000, async () => {
      const securities = await Promise.all(symbols.map((s) => securitiesRepository.getBySymbol(exchange, s)));
      const ids = securities.filter((s): s is NonNullable<typeof s> => s !== null).map((s) => s.id);
      return pricesRepository.getQuotesBatch(ids);
    });
    quotes.forEach(checkQuoteFreshness);
    return quotes;
  },
};