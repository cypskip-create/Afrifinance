import { useQuery } from "@tanstack/react-query";
import { volumeProfileApi } from "@/api/volumeProfileApi";
import { useExchange } from "@/hooks/useExchange";

export function useVolumeProfile(symbol: string, from?: string, to?: string, exchange?: string) {
  const { exchange: selectedExchange } = useExchange();
  const activeExchange = exchange ?? selectedExchange;

  const query = useQuery({
    queryKey: ["continua", "volume-profile", activeExchange, symbol, from, to],
    queryFn: () => volumeProfileApi.get(symbol, activeExchange, from, to),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return { profile: query.data, isLoading: query.isLoading, isError: query.isError };
}