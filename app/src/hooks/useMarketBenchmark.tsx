import { useQuery, useQueries } from "@tanstack/react-query";
import { screenerApi } from "@/api/screenerApi";
import { researchApi } from "@/api/researchApi";

export interface BenchmarkAverages {
  pe: number | null;
  dividendYield: number | null;
  priceMomentum3m: number | null;
  debtToEquity: number | null;
  roe: number | null;
  sampleSize: number;
  sampleLabel: string;
}

function average(nums: (number | null | undefined)[]): number | null {
  const valid = nums.filter((n): n is number => n != null && Number.isFinite(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

const SAMPLE_SIZE = 15;

/** "Market" benchmark for the Analysis tab, defined as the {SAMPLE_SIZE}
 *  largest NSE-listed companies by market cap — not the full exchange.
 *  Continua doesn't have a cheap bulk endpoint for per-security ratios
 *  (debt/equity, ROE, momentum), so averaging across every listed security
 *  would mean one network call per ticker on every page load. A market-cap
 *  sample is an honest, clearly-labelled substitute rather than a silent
 *  full-market claim — see sampleLabel, which callers should render as-is. */
export function useMarketBenchmark() {
  const sampleQuery = useQuery({
    queryKey: ["continua", "screener", "market-cap-sample", SAMPLE_SIZE],
    queryFn: () => screenerApi.run({ sortBy: "marketCap", sortDirection: "desc", limit: SAMPLE_SIZE }),
    staleTime: 15 * 60_000,
  });

  const rows = sampleQuery.data ?? [];

  const researchResults = useQueries({
    queries: rows.map((row) => ({
      queryKey: ["continua", "research", row.symbol],
      queryFn: () => researchApi.get(row.symbol),
      staleTime: 15 * 60_000,
      retry: 1,
      enabled: !!row.symbol,
    })),
  });

  const isLoading = sampleQuery.isLoading || researchResults.some((r) => r.isLoading);

  const averages: BenchmarkAverages = {
    pe: average(rows.map((r) => r.pe)),
    dividendYield: average(rows.map((r) => r.dividendYield)),
    priceMomentum3m: average(researchResults.map((r) => r.data?.ratios.priceMomentum3m)),
    debtToEquity: average(researchResults.map((r) => r.data?.ratios.debtToEquity)),
    roe: average(researchResults.map((r) => r.data?.ratios.roe)),
    sampleSize: rows.length,
    sampleLabel: `NSE Top ${rows.length || SAMPLE_SIZE} by Market Cap`,
  };

  return { averages, isLoading };
}