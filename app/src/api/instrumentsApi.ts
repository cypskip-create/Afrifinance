import { afriFinanceFetch } from "./client";
import type { Instrument } from "./types";

/** The full tradable-instrument universe for an exchange. Use this instead
 *  of a hardcoded ticker list wherever a page needs to know "what stocks
 *  exist" (watchlist add-search, all-stocks pages, screener sector
 *  pickers) — it can never drift out of sync with what the Data Layer
 *  actually has quotes/fundamentals for, the way a hand-maintained array
 *  eventually does. */
export const instrumentsApi = {
  list(exchange = "NSE") {
    return afriFinanceFetch<Instrument[]>("/instruments", { params: { exchange } });
  },
};