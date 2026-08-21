import { continuaFetch } from "./client";

export interface ValuationModel {
  model: string;
  fairValue: number | null;
  currentPrice: number;
  upsidePercent: number | null;
  inputs: Record<string, number | string | null>;
  methodology: string;
  unavailableReason?: string;
}

export interface ValuationResult {
  symbol: string;
  exchange: string;
  currentPrice: number;
  models: ValuationModel[];
  caveat: string;
}

export const valuationApi = {
  get(symbol: string, exchange = "NSE") {
    return continuaFetch<ValuationResult>(`/valuation/${encodeURIComponent(symbol)}`, { params: { exchange } });
  },
};