/**
 * Cache abstraction. CACHE_DRIVER=memory (default) needs zero setup and is
 * fine for a single-instance deploy. Flip to CACHE_DRIVER=redis once you're
 * running multiple API instances that need to share a hot-quote cache.
 * Callers only ever depend on ICache — swapping drivers touches this file only.
 */
import { LRUCache } from "lru-cache";
import { env } from "../config/index.js";
import { logger } from "../monitoring/logger.js";

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  getOrSet<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T>;
}

class InMemoryCache implements ICache {
  // Stored as `any` deliberately — this cache holds heterogeneous value
  // types (Quote, Quote[], Candle[], ratios, ...) keyed by string, and the
  // public ICache methods are what provide type safety to callers via T.
  private store = new LRUCache<string, any>({ max: 5000, ttl: 60_000 });

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T | undefined) ?? null;
  }
  async set<T>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    this.store.set(key, value, { ttl: ttlMs });
  }
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
  async getOrSet<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttlMs);
    return value;
  }
}

/** Stub — implement with `ioredis` when you actually run multi-instance.
 *  Kept out of dependencies until then so `npm install` stays lean. */
class RedisCache implements ICache {
  constructor() {
    throw new Error(
      "RedisCache is a scaffold only. Install ioredis, implement get/set/del " +
      "against REDIS_URL, then remove this guard. Until then use CACHE_DRIVER=memory."
    );
  }
  get<T>(): Promise<T | null> { throw new Error("not implemented"); }
  set(): Promise<void> { throw new Error("not implemented"); }
  del(): Promise<void> { throw new Error("not implemented"); }
  getOrSet<T>(): Promise<T> { throw new Error("not implemented"); }
}

function createCache(): ICache {
  if (env.CACHE_DRIVER === "redis") {
    logger.info("Using Redis cache driver");
    return new RedisCache();
  }
  logger.info("Using in-memory cache driver");
  return new InMemoryCache();
}

export const cache = createCache();

/** Cache key conventions — keep these consistent so invalidation stays sane. */
export const CacheKeys = {
  quote: (symbol: string) => `quote:${symbol}`,
  quotesBatch: (symbols: string[]) => `quotes:${[...symbols].sort().join(",")}`,
  movers: () => "movers:all",
  candles: (symbol: string, interval: string, from: string, to: string) => `candles:${symbol}:${interval}:${from}:${to}`,
  ratios: (symbol: string) => `ratios:${symbol}`,
  afriScore: (symbol: string) => `afriscore:${symbol}`,
  sectors: () => "sectors:all",
};