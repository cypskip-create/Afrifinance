import { continuaFetch } from "./client";
import type { CompanyProfile } from "./types";

export const companiesApi = {
  getProfile(symbol: string, exchange = "NSE") {
    return continuaFetch<CompanyProfile>(`/companies/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};