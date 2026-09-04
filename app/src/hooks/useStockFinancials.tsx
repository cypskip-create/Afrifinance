import { useQuery } from "@tanstack/react-query";
import { financialsApi } from "@/api/financialsApi";

/** Real financial statements for one stock, used across the Growth,
 *  Performance, and Health research tabs. `history` (up to 5 annual
 *  periods) only carries revenue/netIncome/eps per the backend's history
 *  endpoint — no balance-sheet or cash-flow time series is available, so
 *  those tabs show the `latest` full statement bundle as a current
 *  snapshot rather than inventing a multi-year trend. */
export function useStockFinancials(symbol: string | undefined) {
  const history = useQuery({
    queryKey: ["continua", "financials-history", symbol, "annual", 5],
    queryFn: () => financialsApi.getHistory(symbol as string, { periodType: "annual", limit: 5 }),
    enabled: !!symbol,
    staleTime: 30 * 60_000,
    retry: 1,
  });

  const latest = useQuery({
    queryKey: ["continua", "financials-latest", symbol],
    queryFn: () => financialsApi.getLatest(symbol as string),
    enabled: !!symbol,
    staleTime: 30 * 60_000,
    retry: 1,
  });

  return {
    history: history.data ?? [],
    latest: latest.data,
    isLoading: history.isLoading || latest.isLoading,
  };
}