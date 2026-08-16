import { pricesRepository } from "../../storage/repositories/pricesRepository.js";
import { cache, CacheKeys } from "../../storage/cache.js";
import type { ExchangeCode } from "../../config/index.js";

export const moversService = {
  async getTopMovers(exchange: ExchangeCode, limit = 10) {
    return cache.getOrSet(CacheKeys.movers(), 15_000, () => pricesRepository.getTopMovers(exchange, limit));
  },
};