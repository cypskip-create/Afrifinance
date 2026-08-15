import { useMemo } from "react";
import { useLiveQuotes } from "./useLiveQuotes";

interface PriceData {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  /** "live" = real Continua Data Layer quote; "fallback" = this symbol
   *  isn't in the Data Layer's current universe yet (e.g. a non-NSE ticker,
   *  or an exchange not onboarded), so a deterministic placeholder is used
   *  instead of silently showing nothing. */
  source: "live" | "fallback";
}

// Deterministic placeholder for symbols the Continua Data Layer doesn't
// have yet (crypto tickers, symbols on exchanges not onboarded). Seeded so
// re-renders don't make the number jump around — this is display filler,
// not a simulation of live movement.
const FALLBACK_BASE_PRICES: Record<string, number> = {
  NMG: 25.4, BTC: 43250, ETH: 2580, SOL: 98.45, BNB: 312.45,
};

function seededOffset(symbol: string): number {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((seed % 200) - 100) / 10000; // small, stable +/-1% band
}

function buildFallback(symbol: string): PriceData {
  const base = FALLBACK_BASE_PRICES[symbol] ?? 100;
  const offset = seededOffset(symbol);
  const price = base * (1 + offset);
  return {
    symbol,
    price,
    previousPrice: base,
    change: price - base,
    changePercent: offset * 100,
    volume: 0,
    high: price * 1.01,
    low: price * 0.99,
    open: base,
    timestamp: Date.now(),
    source: "fallback",
  };
}

/** Live prices for a set of symbols, sourced from the Continua Data
 *  Layer (REST snapshot + WebSocket ticks — see api/websocketClient.ts).
 *  Symbols outside the Data Layer's current universe fall back to a
 *  stable placeholder rather than breaking the UI; see `source` above.
 *
 *  This used to be a client-side random-walk simulation ("replace with
 *  actual WebSocket/API" was the old TODO here) — it now is that. */
export function useRealtimePrices(symbols: string[]) {
  const { quotes, isConnected } = useLiveQuotes(symbols);

  const prices = useMemo(() => {
    const result: Record<string, PriceData> = {};
    symbols.forEach((symbol) => {
      const key = symbol.toUpperCase();
      const quote = quotes[key];
      result[symbol] = quote
        ? {
            symbol,
            price: quote.lastPrice,
            previousPrice: quote.previousClose,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            timestamp: new Date(quote.timestamp).getTime(),
            source: "live",
          }
        : buildFallback(symbol);
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(","), quotes]);

  return { prices, isConnected };
}

/** Hook for a single stock's real-time price. */
export function useRealtimePrice(symbol: string) {
  const { prices, isConnected } = useRealtimePrices([symbol]);
  return { price: prices[symbol], isConnected };
}