import { useQuery } from "@tanstack/react-query";
import { indicesApi } from "@/api/indicesApi";
import { useExchange } from "@/hooks/useExchange";

/** Benchmark/market indices (NASI, NGX30, ...) for the selected exchange,
 *  sourced from the Data Layer's `/indices` endpoint — populated by
 *  workers/indexWorker.ts (backend), which polls each adapter's
 *  getIndices() every INDEX_POLL_INTERVAL_MS (default 5 min). Slower
 *  cadence than useLiveQuotes is deliberate: an index is a derived
 *  composite, not something that needs sub-minute refresh, and Mansa's
 *  own index data doesn't update any faster than that anyway. */
export function useIndices(exchange?: string) {
  const { exchange: selectedExchange } = useExchange();
  const activeExchange = exchange ?? selectedExchange;

  const query = useQuery({
    queryKey: ["continua", "indices", activeExchange],
    queryFn: () => indicesApi.list(activeExchange),
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });

  return {
    indices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}