import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { quotesApi } from "@/api/quotesApi";
import { afriFinanceRealtime } from "@/api/websocketClient";
import type { Quote } from "@/api/types";

/**
 * The single hook every screen should use to get live AfriFinance quotes.
 * REST gives the initial snapshot (and a periodic safety-net refetch);
 * the shared WebSocket connection (api/websocketClient.ts) layers live
 * ticks on top as they arrive. Multiple components calling this with
 * overlapping symbol sets share the same underlying WS subscriptions.
 *
 * Symbols the Data Layer doesn't know about (outside the current NSE mock
 * universe, or a future exchange not yet onboarded) simply won't appear in
 * `quotes` — callers should treat a missing symbol as "not covered yet",
 * not as an error, and fall back to their own display data if needed.
 */
export function useLiveQuotes(symbols: string[]) {
  const normalized = useMemo(
    () => [...new Set(symbols.map((s) => s.toUpperCase()))].sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbols.join(",")]
  );
  const key = normalized.join(",");

  const query = useQuery({
    queryKey: ["afrifinance", "quotes", key],
    queryFn: () => quotesApi.getBatch(normalized),
    enabled: normalized.length > 0,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
  });

  const [liveTicks, setLiveTicks] = useState<Record<string, Quote>>({});
  const [isConnected, setIsConnected] = useState(afriFinanceRealtime.isConnected());

  useEffect(() => {
    setLiveTicks({});
    const unsubscribers = normalized.map((symbol) =>
      afriFinanceRealtime.subscribeQuote(symbol, (quote) => {
        setLiveTicks((prev) => ({ ...prev, [symbol]: quote }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => afriFinanceRealtime.onConnectionChange(setIsConnected), []);

  const quotes = useMemo(() => {
    const map: Record<string, Quote> = {};
    (query.data ?? []).forEach((q) => { map[q.symbol.toUpperCase()] = q; });
    Object.values(liveTicks).forEach((q) => { map[q.symbol.toUpperCase()] = q; });
    return map;
  }, [query.data, liveTicks]);

  return {
    quotes,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isConnected,
    refetch: query.refetch,
  };
}

/** Single-symbol convenience wrapper over useLiveQuotes. */
export function useLiveQuote(symbol: string | undefined) {
  const { quotes, isLoading, isError, error, isConnected, refetch } = useLiveQuotes(symbol ? [symbol] : []);
  const quote = symbol ? quotes[symbol.toUpperCase()] : undefined;
  return { quote, isLoading, isError, error, isConnected, refetch };
}