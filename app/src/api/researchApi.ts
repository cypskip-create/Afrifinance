import { continuaFetch } from "./client";
import type { ResearchBundle } from "./types";

export const researchApi = {
  get(symbol: string, exchange = "NSE") {
    return continuaFetch<ResearchBundle>(`/research/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};