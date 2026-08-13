import { useQuery } from "@tanstack/react-query";
import { instrumentsApi } from "@/api/instrumentsApi";
import { CANONICAL_SYMBOLS, STOCK_META } from "@/lib/stockPrices";

export interface InstrumentOption {
  symbol: string;
  name: string;
  sector?: string;
}

/** Local fallback so "add to watchlist" / stock pickers still work if the
 *  AfriFinance Data API is unreachable — matches the shape instrumentsApi
 *  returns, just without live coverage info. */
const STATIC_FALLBACK: InstrumentOption[] = CANONICAL_SYMBOLS.map((symbol) => ({
  symbol,
  name: STOCK_META[symbol].name,
  sector: STOCK_META[symbol].sector,
}));

/** The exchange's tradable-instrument list, sourced from the Data Layer's
 *  `/instruments` endpoint (backend/src/api/controllers/instruments.controller.ts)
 *  so any symbol picker reflects what the backend actually has data for,
 *  instead of a hand-maintained array that can silently drift out of sync. */
export function useInstruments(exchange = "NSE") {
  const query = useQuery({
    queryKey: ["afrifinance", "instruments", exchange],
    queryFn: () => instrumentsApi.list(exchange),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const instruments: InstrumentOption[] =
    query.data?.map((i) => ({ symbol: i.symbol, name: i.companyName, sector: i.sector ?? undefined })) ??
    (query.isError ? STATIC_FALLBACK : []);

  return { instruments, isLoading: query.isLoading, isError: query.isError };
}