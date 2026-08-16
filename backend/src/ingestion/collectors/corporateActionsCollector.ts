import type { IExchangeAdapter } from "../../adapters/types.js";
import type { CorporateAction, EarningsEvent, OwnershipRecord } from "../../types/market.js";
import { withRetry } from "../retry.js";

export interface OwnershipCollectionResult {
  records: OwnershipRecord[];
  failures: { symbol: string; error: string }[];
}

export const corporateActionsCollector = {
  async collectActions(adapter: IExchangeAdapter, since: string): Promise<CorporateAction[]> {
    return withRetry(() => adapter.getCorporateActions(null, since), { label: `${adapter.exchange}.getCorporateActions` });
  },
  async collectEarnings(adapter: IExchangeAdapter, since: string): Promise<EarningsEvent[]> {
    return withRetry(() => adapter.getEarningsEvents(null, since), { label: `${adapter.exchange}.getEarningsEvents` });
  },
  async collectOwnership(adapter: IExchangeAdapter, symbols: string[]): Promise<OwnershipCollectionResult> {
    const results = await Promise.allSettled(
      symbols.map((s) => withRetry(() => adapter.getOwnership(s), { label: `${adapter.exchange}.getOwnership(${s})` }))
    );
    const records: OwnershipRecord[] = [];
    const failures: { symbol: string; error: string }[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") records.push(...r.value);
      else failures.push({ symbol: symbols[i]!, error: String(r.reason) });
    });
    return { records, failures };
  },
};