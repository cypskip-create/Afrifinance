import { continuaFetch } from "./client";
import type { ScreenerRow } from "./types";

export interface ScreenerFilters {
  exchange?: string;
  sector?: string;
  minMarketCap?: number;
  maxPe?: number;
  minDividendYield?: number;
  minAfriScore?: number;
  sortBy?: "afriScore" | "changePercent" | "marketCap" | "dividendYield" | "pe";
  sortDirection?: "asc" | "desc";
  limit?: number;
}

export const screenerApi = {
  run(filters: ScreenerFilters = {}) {
    return continuaFetch<ScreenerRow[]>("/screener", {
      params: { exchange: "NSE", ...filters },
    });
  },
};