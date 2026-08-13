import { afriFinanceFetch } from "./client";
import type { ResearchBundle } from "./types";

export const researchApi = {
  get(symbol: string, exchange = "NSE") {
    return afriFinanceFetch<ResearchBundle>(`/research/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};