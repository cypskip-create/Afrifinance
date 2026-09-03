import { useQueries } from "@tanstack/react-query";
import { valuationApi, type ValuationResult } from "@/api/valuationApi";
import { useExchange } from "@/hooks/useExchange";

/** Fetches the real, model-based valuation (see backend/src/services/technical/
 *  valuationService.ts) for every symbol in the portfolio in parallel, keyed by
 *  symbol. Each query is independently cached/retried by react-query, so one
 *  slow or missing symbol never blocks the others from rendering. */
export function usePortfolioValuations(symbols: string[]) {
  const { exchange } = useExchange();
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];

  const results = useQueries({
    queries: uniqueSymbols.map((symbol) => ({
      queryKey: ["continua", "valuation", exchange, symbol],
      queryFn: () => valuationApi.get(symbol, exchange),
      staleTime: 5 * 60_000,
      retry: 1,
    })),
  });

  const valuations: Record<string, ValuationResult | undefined> = {};
  uniqueSymbols.forEach((symbol, i) => {
    valuations[symbol] = results[i]?.data;
  });

  return {
    valuations,
    isLoading: results.some((r) => r.isLoading),
  };
}