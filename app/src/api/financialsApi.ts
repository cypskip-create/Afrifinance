import { afriFinanceFetch } from "./client";
import type { FiscalPeriodType, FinancialHistoryEntry, FinancialPeriodBundle } from "./types";

export const financialsApi = {
  getLatest(symbol: string, opts: { periodType?: FiscalPeriodType; exchange?: string } = {}) {
    const { periodType = "annual", exchange = "NSE" } = opts;
    return afriFinanceFetch<FinancialPeriodBundle>(`/financials/${encodeURIComponent(symbol)}`, {
      params: { exchange, periodType },
    });
  },

  getHistory(symbol: string, opts: { periodType?: FiscalPeriodType; limit?: number; exchange?: string } = {}) {
    const { periodType = "annual", limit = 5, exchange = "NSE" } = opts;
    return afriFinanceFetch<FinancialHistoryEntry[]>(`/financials/${encodeURIComponent(symbol)}/history`, {
      params: { exchange, periodType, limit },
    });
  },
};