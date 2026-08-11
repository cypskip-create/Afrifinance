import type { IExchangeAdapter, FundamentalsBundle } from "../../adapters/types.js";

export const fundamentalsCollector = {
  async collectForSymbols(adapter: IExchangeAdapter, symbols: string[]): Promise<FundamentalsBundle[]> {
    const results = await Promise.allSettled(symbols.map((s) => adapter.getFundamentals(s)));
    return results
      .filter((r): r is PromiseFulfilledResult<FundamentalsBundle | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is FundamentalsBundle => v !== null);
  },
};