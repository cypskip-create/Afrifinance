import { continuaFetch } from "./client";
import type { Quote } from "./types";

export const quotesApi = {
  getOne(symbol: string, exchange = "NSE") {
    return continuaFetch<Quote>(`/quotes/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },

  getBatch(symbols: string[], exchange = "NSE") {
    if (symbols.length === 0) return Promise.resolve<Quote[]>([]);
    return continuaFetch<Quote[]>("/quotes", { params: { exchange, symbols: symbols.join(",") } });
  },
};