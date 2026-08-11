/**
 * The contract every exchange adapter must satisfy. The ingestion layer only
 * ever talks to this interface — it has no idea whether it's NSE, NGX, or
 * JSE underneath. Add a new exchange by implementing this interface once,
 * then registering it in adapters/registry.ts. Nothing else changes.
 */
import type {
  Quote, Candle, Company, Security, FinancialPeriod,
  IncomeStatement, BalanceSheet, CashFlowStatement,
  CorporateAction, EarningsEvent, OwnershipRecord,
} from "../types/market.js";
import type { ExchangeCode } from "../config/index.js";

export interface FundamentalsBundle {
  security: Security;
  company: Company;
  period: FinancialPeriod;
  income: IncomeStatement;
  balance: BalanceSheet;
  cashFlow: CashFlowStatement;
}

export interface IExchangeAdapter {
  readonly exchange: ExchangeCode;

  /** Full list of currently listed securities on this exchange. */
  listSecurities(): Promise<Security[]>;

  /** Latest quote for one or more symbols. */
  getQuotes(symbols: string[]): Promise<Quote[]>;

  /** Historical OHLCV candles for a symbol/interval/date range. */
  getCandles(symbol: string, interval: Candle["interval"], from: string, to: string): Promise<Candle[]>;

  /** Company + latest fundamentals bundle for a symbol. */
  getFundamentals(symbol: string): Promise<FundamentalsBundle | null>;

  /** Corporate actions for a symbol (or all, if symbol omitted) since a given date. */
  getCorporateActions(symbol: string | null, since: string): Promise<CorporateAction[]>;

  /** Upcoming/recent earnings events. */
  getEarningsEvents(symbol: string | null, since: string): Promise<EarningsEvent[]>;

  /** Ownership breakdown for a symbol, where available. */
  getOwnership(symbol: string): Promise<OwnershipRecord[]>;

  /** Subscribe to a continuous live tick stream. Returns an unsubscribe fn.
   *  Mock mode simulates ticks on an interval; a real feed would open a
   *  WebSocket/FIX session to the licensed provider here instead. */
  subscribeQuotes(symbols: string[], onQuote: (quote: Quote) => void): () => void;
}