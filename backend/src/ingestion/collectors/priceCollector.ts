/**
 * Collectors are thin: ask an adapter for data, retrying transient
 * failures. All the interesting logic (normalize, validate, persist,
 * cache, log) lives in the pipeline. Keeping collectors thin means
 * swapping "which adapter" never touches pipeline logic.
 */
import type { IExchangeAdapter } from "../../adapters/types.js";
import type { Quote } from "../../types/market.js";
import { withRetry } from "../retry.js";

export const priceCollector = {
  async collectQuotes(adapter: IExchangeAdapter, symbols: string[] = []): Promise<Quote[]> {
    return withRetry(() => adapter.getQuotes(symbols), { label: `${adapter.exchange}.getQuotes` });
  },
};