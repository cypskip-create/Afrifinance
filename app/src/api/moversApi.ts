import { afriFinanceFetch } from "./client";
import type { Movers } from "./types";

export const moversApi = {
  getTopMovers(opts: { limit?: number; exchange?: string } = {}) {
    const { limit = 10, exchange = "NSE" } = opts;
    return afriFinanceFetch<Movers>("/movers", { params: { exchange, limit } });
  },
};