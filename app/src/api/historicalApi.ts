import { continuaFetch } from "./client";
import type { Candle, CandleInterval, RangePerformance } from "./types";

export const historicalApi = {
  getCandles(
    symbol: string,
    opts: { interval?: CandleInterval; from?: string; to?: string; exchange?: string } = {}
  ) {
    const { interval = "1d", from, to, exchange = "NSE" } = opts;
    return continuaFetch<Candle[]>(`/historical/${encodeURIComponent(symbol)}`, {
      params: { exchange, interval, from, to },
    });
  },

  getPerformance(symbol: string, from: string, opts: { to?: string; exchange?: string } = {}) {
    const { to, exchange = "NSE" } = opts;
    return continuaFetch<RangePerformance>(`/historical/${encodeURIComponent(symbol)}/performance`, {
      params: { exchange, from, to },
    });
  },
};