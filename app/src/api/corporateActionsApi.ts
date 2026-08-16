import { continuaFetch } from "./client";
import type { CorporateAction, OwnershipRecord } from "./types";

export const corporateActionsApi = {
  getForSymbol(symbol: string, exchange = "NSE") {
    return continuaFetch<CorporateAction[]>(`/corporate-actions/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },

  getDividends(symbol: string, exchange = "NSE") {
    return continuaFetch<CorporateAction[]>(`/dividends/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },

  getOwnership(symbol: string, exchange = "NSE") {
    return continuaFetch<OwnershipRecord[]>(`/ownership/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};