import type { IExchangeAdapter } from "../../adapters/types.js";
import type { CorporateAction, EarningsEvent, OwnershipRecord } from "../../types/market.js";

export const corporateActionsCollector = {
  async collectActions(adapter: IExchangeAdapter, since: string): Promise<CorporateAction[]> {
    return adapter.getCorporateActions(null, since);
  },
  async collectEarnings(adapter: IExchangeAdapter, since: string): Promise<EarningsEvent[]> {
    return adapter.getEarningsEvents(null, since);
  },
  async collectOwnership(adapter: IExchangeAdapter, symbols: string[]): Promise<OwnershipRecord[]> {
    const results = await Promise.allSettled(symbols.map((s) => adapter.getOwnership(s)));
    return results.filter((r): r is PromiseFulfilledResult<OwnershipRecord[]> => r.status === "fulfilled").flatMap((r) => r.value);
  },
};