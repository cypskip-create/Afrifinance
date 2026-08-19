import type { IExchangeAdapter } from "../../adapters/types.js";
import type { MarketIndex } from "../../types/market.js";
import { withRetry } from "../retry.js";

export const indexCollector = {
  async collectIndices(adapter: IExchangeAdapter): Promise<MarketIndex[]> {
    return withRetry(() => adapter.getIndices(), { label: `${adapter.exchange}.getIndices` });
  },
};