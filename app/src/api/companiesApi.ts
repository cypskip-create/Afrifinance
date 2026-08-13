import { afriFinanceFetch } from "./client";
import type { CompanyProfile } from "./types";

export const companiesApi = {
  getProfile(symbol: string, exchange = "NSE") {
    return afriFinanceFetch<CompanyProfile>(`/companies/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};