import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/api/companiesApi";
import { isNotFound } from "@/api/client";

/** Company profile (description, HQ, CEO, employees, founded, sector) from
 *  the Data Layer's `/companies/:symbol`. `data` is `undefined` for a
 *  symbol outside the current universe — callers should fall back to a
 *  generic description rather than showing an error. */
export function useCompanyProfile(symbol: string | undefined) {
  const query = useQuery({
    queryKey: ["continua", "company", symbol],
    queryFn: () => companiesApi.getProfile(symbol as string),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
    retry: (count, err) => !isNotFound(err) && count < 1,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isNotCovered: isNotFound(query.error),
  };
}