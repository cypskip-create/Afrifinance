/**
 * The NSE adapter — implements IExchangeAdapter by composing the NSE client
 * (transport) with the NSE mapper (translation). This is the ONLY file the
 * ingestion layer imports from this folder; nseClient.ts and nseMapper.ts
 * are implementation details of the NSE adapter.
 */
import type { IExchangeAdapter, FundamentalsBundle } from "../types.js";
import type { Quote, Candle, Security, CorporateAction, EarningsEvent, OwnershipRecord } from "../../types/market.js";
import { createNseClient, type INseClient } from "./nseClient.js";
import {
  mapSecurity, mapQuote, mapCandle, mapFundamentalsBundle,
  mapCorporateAction, mapEarningsEvent, mapOwnership,
} from "./nseMapper.js";
import type { NseRawCandle } from "./nseRawTypes.js";

const INTERVAL_TO_RAW: Record<Candle["interval"], NseRawCandle["Interval"]> = {
  "1m": "1MIN", "5m": "5MIN", "15m": "15MIN", "1h": "1HR",
  "1d": "1D", "1w": "1W", "1M": "1MO", "1y": "1Y",
};

export class NseAdapter implements IExchangeAdapter {
  readonly exchange = "NSE" as const;
  private client: INseClient;

  constructor(client: INseClient = createNseClient()) {
    this.client = client;
  }

  async listSecurities(): Promise<Security[]> {
    const raw = await this.client.fetchSecurities();
    return raw.map(mapSecurity);
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const raw = await this.client.fetchQuotes(symbols);
    return raw.map(mapQuote);
  }

  async getCandles(symbol: string, interval: Candle["interval"], from: string, to: string): Promise<Candle[]> {
    const raw = await this.client.fetchCandles(symbol, INTERVAL_TO_RAW[interval], from, to);
    return raw.map(mapCandle);
  }

  async getFundamentals(symbol: string): Promise<FundamentalsBundle | null> {
    const [securities, profile, periods] = await Promise.all([
      this.client.fetchSecurities(),
      this.client.fetchCompanyProfile(symbol),
      this.client.fetchFinancials(symbol),
    ]);
    const security = securities.find((s) => s.Symbol === symbol);
    const latestPeriod = periods.sort((a, b) => b.FiscalYear - a.FiscalYear)[0];
    if (!security || !latestPeriod) return null;
    return mapFundamentalsBundle(security, profile, latestPeriod);
  }

  async getCorporateActions(symbol: string | null, since: string): Promise<CorporateAction[]> {
    const raw = await this.client.fetchCorporateActions(symbol, since);
    return raw.map((r, i) => mapCorporateAction(r, `NSE:ca:${r.Symbol}:${r.ActionType}:${r.AnnouncedDate}:${i}`));
  }

  async getEarningsEvents(symbol: string | null, since: string): Promise<EarningsEvent[]> {
    const raw = await this.client.fetchEarningsEvents(symbol, since);
    return raw.map((r, i) => mapEarningsEvent(r, `NSE:earn:${r.Symbol}:${r.FiscalYear}:${r.FiscalQuarter ?? 0}:${i}`));
  }

  async getOwnership(symbol: string): Promise<OwnershipRecord[]> {
    const raw = await this.client.fetchOwnership(symbol);
    return raw.map(mapOwnership);
  }

  subscribeQuotes(symbols: string[], onQuote: (quote: Quote) => void): () => void {
    return this.client.streamQuotes(symbols, (raw) => onQuote(mapQuote(raw)));
  }
}