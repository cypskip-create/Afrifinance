import { afriFinanceFetch } from "./client";
import type { CorporateAction, OwnershipRecord } from "./types";

export const corporateActionsApi = {
  getForSymbol(symbol: string, exchange = "NSE") {
    return afriFinanceFetch<CorporateAction[]>(`/corporate-actions/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },

  getDividends(symbol: string, exchange = "NSE") {
    return afriFinanceFetch<CorporateAction[]>(`/dividends/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },

  getOwnership(symbol: string, exchange = "NSE") {
    return afriFinanceFetch<OwnershipRecord[]>(`/ownership/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};