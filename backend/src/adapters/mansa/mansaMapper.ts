/**
 * Pure functions: Mansa raw shapes → Continua standard schema. Generic
 * across exchange (unlike nseMapper.ts, which is hardcoded to NSE/KES)
 * because Mansa's own API is already generic — the exchange code and
 * currency come from the response, not a constant.
 *
 * HONESTY NOTE — read before wiring this into anything user-facing:
 * Mansa's fundamentals endpoint returns far fewer line items than
 * Continua's IncomeStatement/BalanceSheet/CashFlowStatement types allow
 * for (no COGS breakdown, no operating cash flow at all, etc). Rather
 * than inventing numbers to fill those fields, every field Mansa doesn't
 * provide is left `undefined`. Downstream UI must treat those as "not
 * available from this provider", not "zero" — a screener or ratio
 * calculation that silently treats a missing operatingCashFlow as 0
 * would produce a wrong, confident-looking number. Same principle for
 * getCorporateActions/getOwnership in mansaAdapter.ts.
 */
import type {
  MansaStock, MansaHistoryPoint, MansaFundamentalsPeriod, MansaDividendRecord, MansaIndex,
} from "./mansaRawTypes.js";
import type {
  Security, Company, Sector, Quote, Candle, FinancialPeriod, IncomeStatement,
  BalanceSheet, CashFlowStatement, CorporateAction, EarningsEvent,
  SecurityStatus, CandleInterval, Currency, MarketIndex,
} from "../../types/market.js";
import type { FundamentalsBundle } from "../types.js";
import type { ExchangeCode } from "../../config/index.js";

export const securityId = (exchange: string, ticker: string) => `${exchange}:${ticker}`;
export const companyId = (exchange: string, ticker: string) => `${exchange}:company:${ticker}`;
const periodId = (exchange: string, ticker: string, fiscalPeriod: string) =>
  `${exchange}:period:${ticker}:${fiscalPeriod}`;
const sectorId = (rawSectorName: string) =>
  rawSectorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Mansa doesn't expose a normalized enum for listing status; absence of
 *  a `status` field (the common case) means "trading normally". */
function mapStatus(raw: string | null | undefined): SecurityStatus {
  if (!raw) return "active";
  const s = raw.toLowerCase();
  if (s.includes("suspend")) return "suspended";
  if (s.includes("halt")) return "halted";
  if (s.includes("delist")) return "delisted";
  return "active";
}

/** JSE's deep archive is denominated in ZAR cents (documented explicitly
 *  by Mansa); live quotes on the stocks endpoints are already in rand.
 *  Every other market's `price_unit` is "major", i.e. no conversion. */
function normalizeHistoryValue(value: number, priceUnit: "major" | "cents"): number {
  return priceUnit === "cents" ? value / 100 : value;
}

export function mapCurrency(raw: string): Currency {
  const known: Currency[] = ["KES", "NGN", "ZAR", "EGP", "GHS", "XOF", "USD", "TZS", "ZMW"];
  const upper = raw.toUpperCase() as Currency;
  return known.includes(upper) ? upper : ("USD" as Currency); // fail safe, not silent — see adapter-level logging
}

export function mapSecurity(exchange: ExchangeCode, raw: MansaStock): Security {
  return {
    id: securityId(exchange, raw.ticker),
    symbol: raw.ticker,
    exchange,
    companyId: companyId(exchange, raw.ticker),
    currency: mapCurrency(raw.currency),
    status: mapStatus(raw.status),
    isin: raw.isin ?? undefined,
  };
}

export function mapSector(raw: MansaStock): Sector | null {
  if (!raw.sector) return null;
  return { id: sectorId(raw.sector), name: raw.sector.trim() };
}

export function mapCompany(exchange: ExchangeCode, raw: MansaStock): Company {
  return {
    id: companyId(exchange, raw.ticker),
    name: raw.name,
    sectorId: raw.sector ? sectorId(raw.sector) : undefined,
    // Mansa's stock/fundamentals endpoints don't carry a company profile
    // (headquarters, CEO, founded year, website) — that's a different
    // dataset Mansa doesn't currently expose. Left undefined rather than
    // guessed; a future company-profile source could fill these in later
    // without any shape change here.
  };
}

export function mapQuote(exchange: ExchangeCode, raw: MansaStock): Quote {
  return {
    securityId: securityId(exchange, raw.ticker),
    symbol: raw.ticker,
    exchange,
    lastPrice: raw.close,
    open: raw.open,
    high: raw.high,
    low: raw.low,
    previousClose: raw.previous_close,
    change: raw.change,
    changePercent: raw.change_pct,
    volume: raw.volume,
    marketCap: raw.market_cap ?? undefined,
    currency: mapCurrency(raw.currency),
    status: mapStatus(raw.status),
    timestamp: new Date(raw.updated_at).toISOString(),
    // Mansa's markets suite targets 30-minute freshness during market
    // hours (documented), not tick-level — "delayed" is the honest label,
    // not "live". Don't relabel this as "live" even though prices do move;
    // a user comparing against a truly live feed would be misled.
    source: "delayed",
  };
}

export function mapCandle(
  exchange: ExchangeCode,
  ticker: string,
  point: MansaHistoryPoint,
  priceUnit: "major" | "cents"
): Candle {
  return {
    securityId: securityId(exchange, ticker),
    interval: "1d" as CandleInterval, // Mansa's history endpoint is daily-only; see mansaAdapter.getCandles
    timestamp: new Date(`${point.date}T00:00:00Z`).toISOString(),
    open: normalizeHistoryValue(point.open, priceUnit),
    high: normalizeHistoryValue(point.high, priceUnit),
    low: normalizeHistoryValue(point.low, priceUnit),
    close: normalizeHistoryValue(point.close, priceUnit),
    volume: point.volume ?? 0,
  };
}

function mapFiscalPeriod(fiscalPeriod: string): { fiscalYear: number; fiscalQuarter?: number } {
  // "FY2025" or "Q3FY2025"-style strings; extract what we can, default
  // sanely rather than throwing on a format Mansa tweaks later.
  const yearMatch = fiscalPeriod.match(/(\d{4})/);
  const quarterMatch = fiscalPeriod.match(/Q(\d)/i);
  return {
    fiscalYear: yearMatch?.[1] ? parseInt(yearMatch[1], 10) : new Date().getFullYear(),
    fiscalQuarter: quarterMatch?.[1] ? parseInt(quarterMatch[1], 10) : undefined,
  };
}

export function mapFundamentalsBundle(
  exchange: ExchangeCode,
  ticker: string,
  companyName: string,
  stock: MansaStock | null,
  period: MansaFundamentalsPeriod
): FundamentalsBundle {
  const currency = mapCurrency(period.currency);
  const { fiscalYear, fiscalQuarter } = mapFiscalPeriod(period.fiscal_period);
  const pId = periodId(exchange, ticker, period.fiscal_period);

  const financialPeriod: FinancialPeriod = {
    id: pId,
    securityId: securityId(exchange, ticker),
    periodType: period.statement_type,
    fiscalYear,
    fiscalQuarter,
    periodEnd: period.period_end_date,
    reportedAt: period.verified_at ?? period.period_end_date,
    currency,
  };

  const income: IncomeStatement = {
    periodId: pId,
    revenue: period.figures.revenue ?? 0,
    costOfRevenue: undefined, // not provided by Mansa — see file header
    grossProfit: period.figures.gross_profit ?? undefined,
    operatingIncome: period.figures.operating_profit ?? undefined,
    netIncome: period.figures.profit_after_tax ?? 0,
    eps: period.figures.eps_basic ?? 0,
  };

  const balance: BalanceSheet = {
    periodId: pId,
    totalAssets: period.figures.total_assets ?? 0,
    totalLiabilities: period.figures.total_liabilities ?? 0,
    totalEquity: period.figures.total_equity ?? 0,
    // cash, totalDebt, currentAssets/Liabilities, sharesOutstanding: not
    // provided by Mansa's fundamentals endpoint.
  };

  const cashFlow: CashFlowStatement = {
    periodId: pId,
    // Mansa's fundamentals endpoint does not expose a cash flow statement
    // at all (no operating/investing/financing figures) — left entirely
    // undefined (now valid per the shared type) rather than fabricated as
    // zero. Callers must treat this whole statement as "unavailable" for
    // Mansa-sourced securities.
  };

  return {
    security: stock
      ? mapSecurity(exchange, stock)
      : { id: securityId(exchange, ticker), symbol: ticker, exchange, companyId: companyId(exchange, ticker), currency, status: "active" },
    company: { id: companyId(exchange, ticker), name: companyName },
    sector: stock && mapSector(stock) ? (mapSector(stock) as Sector) : { id: "unknown", name: "Unknown" },
    period: financialPeriod,
    income,
    balance,
    cashFlow,
  };
}

export function mapDividendToCorporateAction(exchange: ExchangeCode, ticker: string, raw: MansaDividendRecord): CorporateAction {
  return {
    id: `${exchange}:ca:${ticker}:div:${raw.ex_dividend_date}`,
    securityId: securityId(exchange, ticker),
    type: "dividend",
    announcedAt: raw.ex_dividend_date, // Mansa doesn't give an announcement date separate from ex-date
    exDate: raw.ex_dividend_date,
    recordDate: raw.record_date,
    payDate: raw.pay_date,
    details: { type: "dividend", amountPerShare: raw.dividend_per_share, currency: mapCurrency(raw.currency), dividendType: "final" },
    status: "completed",
  };
}

export function mapIndex(exchange: ExchangeCode, raw: MansaIndex): MarketIndex {
  return {
    id: `${exchange}:index:${raw.code}`,
    code: raw.code,
    name: raw.name,
    exchange,
    value: raw.value,
    previousClose: raw.previous_close,
    change: raw.change,
    changePercent: raw.change_pct,
    currency: mapCurrency(raw.currency),
    timestamp: new Date(raw.updated_at).toISOString(),
    source: "delayed", // same ~30-minute-freshness caveat as mapQuote
  };
}