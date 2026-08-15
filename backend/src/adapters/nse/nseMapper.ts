/**
 * Pure functions: NSE raw shapes → Continua standard schema. This is
 * where provider-specific quirks get absorbed — field name differences,
 * enum casing, unit differences (e.g. market cap in millions vs. absolute),
 * timezone normalization (NSE feed times are EAT, we store UTC). Nothing
 * here should ever be imported outside the NSE adapter folder.
 */
import type {
  NseRawSecurity, NseRawQuote, NseRawCandle, NseRawCompanyProfile,
  NseRawFinancialPeriod, NseRawCorporateAction, NseRawEarningsEvent, NseRawOwnership,
} from "./nseRawTypes.js";
import type {
  Security, Company, Sector, Quote, Candle, FinancialPeriod, IncomeStatement,
  BalanceSheet, CashFlowStatement, CorporateAction, CorporateActionDetails,
  EarningsEvent, OwnershipRecord, SecurityStatus, CandleInterval, Currency,
} from "../../types/market.js";
import type { FundamentalsBundle } from "../types.js";

const EXCHANGE = "NSE" as const;

/** Stable natural id — used as the Continua-internal identifier
 *  throughout the pipeline. Simple, deterministic, human-debuggable. */
export const securityId = (symbol: string) => `${EXCHANGE}:${symbol}`;
export const companyId = (symbol: string) => `${EXCHANGE}:company:${symbol}`;
const periodId = (symbol: string, fy: number, fq?: number) =>
  `${EXCHANGE}:period:${symbol}:${fy}${fq ? `Q${fq}` : ""}`;
/** Slug used as the sector's stable id — deliberately mechanical (trim,
 *  lowercase, hyphenate) rather than a judgment call about canonical naming.
 *  Cross-exchange canonicalization of sector NAMES (e.g. reconciling minor
 *  spelling/casing drift between providers) belongs in the normalization
 *  layer, not here — this only needs to be a consistent id for NSE's own
 *  sector strings. */
const sectorId = (rawSectorName: string) =>
  rawSectorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function mapStatus(s: NseRawSecurity["TradingStatus"]): SecurityStatus {
  switch (s) {
    case "ACTIVE": return "active";
    case "SUSPENDED": return "suspended";
    case "HALTED": return "halted";
    case "DELISTED": return "delisted";
  }
}

function mapInterval(i: NseRawCandle["Interval"]): CandleInterval {
  const map: Record<NseRawCandle["Interval"], CandleInterval> = {
    "1MIN": "1m", "5MIN": "5m", "15MIN": "15m", "1HR": "1h",
    "1D": "1d", "1W": "1w", "1MO": "1M", "1Y": "1y",
  };
  return map[i];
}

/** NSE feed timestamps are Africa/Nairobi (EAT, UTC+3) local time without
 *  an offset marker. Normalize explicitly rather than trusting Date parsing
 *  to guess right — this is exactly the kind of silent bug that corrupts
 *  charts three weeks later. */
function toUtcIso(eatLocalIso: string): string {
  const hasOffset = /[zZ]|[+-]\d{2}:\d{2}$/.test(eatLocalIso);
  if (hasOffset) return new Date(eatLocalIso).toISOString();
  return new Date(`${eatLocalIso}+03:00`).toISOString();
}

export function mapSecurity(raw: NseRawSecurity): Security {
  return {
    id: securityId(raw.Symbol),
    symbol: raw.Symbol,
    exchange: EXCHANGE,
    companyId: companyId(raw.Symbol),
    currency: "KES",
    status: mapStatus(raw.TradingStatus),
    isin: raw.ISIN,
    listedAt: raw.ListingDate,
  };
}

export function mapSector(raw: NseRawSecurity): Sector {
  return { id: sectorId(raw.Sector), name: raw.Sector.trim() };
}

export function mapCompany(raw: NseRawSecurity, profile: NseRawCompanyProfile | null): Company {
  return {
    id: companyId(raw.Symbol),
    name: raw.CompanyName,
    description: profile?.Description,
    sectorId: sectorId(raw.Sector),
    headquarters: profile?.Headquarters,
    ceo: profile?.ChiefExecutive,
    employees: profile?.EmployeeCount,
    founded: profile?.FoundedYear,
    website: profile?.Website,
  };
}

export function mapQuote(raw: NseRawQuote): Quote {
  return {
    securityId: securityId(raw.Symbol),
    symbol: raw.Symbol,
    exchange: EXCHANGE,
    lastPrice: raw.LastTradedPrice,
    open: raw.Open,
    high: raw.High,
    low: raw.Low,
    previousClose: raw.PrevClose,
    change: raw.Change,
    changePercent: raw.ChangePct,
    volume: raw.Volume,
    bid: raw.Bid,
    ask: raw.Ask,
    marketCap: raw.MarketCapMn != null ? raw.MarketCapMn * 1_000_000 : undefined,
    currency: raw.Currency as Currency,
    status: mapStatus(raw.TradingStatus),
    timestamp: toUtcIso(raw.EventTimestamp),
    source: "live",
  };
}

export function mapCandle(raw: NseRawCandle): Candle {
  return {
    securityId: securityId(raw.Symbol),
    interval: mapInterval(raw.Interval),
    timestamp: toUtcIso(raw.BarTime),
    open: raw.O, high: raw.H, low: raw.L, close: raw.C, volume: raw.V,
  };
}

export function mapFinancials(raw: NseRawFinancialPeriod): {
  period: FinancialPeriod; income: IncomeStatement; balance: BalanceSheet; cashFlow: CashFlowStatement;
} {
  const id = periodId(raw.Symbol, raw.FiscalYear, raw.FiscalQuarter);
  const period: FinancialPeriod = {
    id, securityId: securityId(raw.Symbol),
    periodType: raw.PeriodType === "ANNUAL" ? "annual" : "quarterly",
    fiscalYear: raw.FiscalYear, fiscalQuarter: raw.FiscalQuarter,
    periodEnd: raw.PeriodEndDate, reportedAt: raw.ReportedDate,
    currency: raw.Currency as Currency,
  };
  const income: IncomeStatement = {
    periodId: id, revenue: raw.Revenue, costOfRevenue: raw.CostOfRevenue, grossProfit: raw.GrossProfit,
    operatingExpenses: raw.OperatingExpenses, operatingIncome: raw.OperatingIncome, netIncome: raw.NetIncome,
    eps: raw.EPS, dilutedEps: raw.DilutedEPS, ebitda: raw.EBITDA,
  };
  const balance: BalanceSheet = {
    periodId: id, totalAssets: raw.TotalAssets, totalLiabilities: raw.TotalLiabilities, totalEquity: raw.TotalEquity,
    cash: raw.Cash, totalDebt: raw.TotalDebt, currentAssets: raw.CurrentAssets,
    currentLiabilities: raw.CurrentLiabilities, sharesOutstanding: raw.SharesOutstanding,
  };
  const cashFlow: CashFlowStatement = {
    periodId: id, operatingCashFlow: raw.OperatingCashFlow, investingCashFlow: raw.InvestingCashFlow,
    financingCashFlow: raw.FinancingCashFlow, freeCashFlow: raw.FreeCashFlow, capex: raw.Capex,
  };
  return { period, income, balance, cashFlow };
}

export function mapFundamentalsBundle(
  security: NseRawSecurity, profile: NseRawCompanyProfile | null, financials: NseRawFinancialPeriod
): FundamentalsBundle {
  const { period, income, balance, cashFlow } = mapFinancials(financials);
  return {
    security: mapSecurity(security), company: mapCompany(security, profile),
    sector: mapSector(security), period, income, balance, cashFlow,
  };
}

function mapActionType(t: NseRawCorporateAction["ActionType"]): CorporateAction["type"] {
  const map: Record<NseRawCorporateAction["ActionType"], CorporateAction["type"]> = {
    DIVIDEND: "dividend", SPLIT: "split", BONUS: "bonus_issue", RIGHTS: "rights_issue",
    BUYBACK: "buyback", MERGER: "merger", ACQUISITION: "acquisition",
    SUSPENSION: "suspension", HALT: "trading_halt",
  };
  return map[t];
}

function mapActionDetails(raw: NseRawCorporateAction): CorporateActionDetails {
  const p = raw.Payload;
  switch (raw.ActionType) {
    case "DIVIDEND":
      return { type: "dividend", amountPerShare: Number(p.AmountPerShare), currency: (p.Currency as Currency) ?? "KES", dividendType: (p.DividendType as any) ?? "final" };
    case "SPLIT":
      return { type: "split", ratioFrom: Number(p.RatioFrom ?? 1), ratioTo: Number(p.RatioTo ?? 1) };
    case "BONUS":
      return { type: "bonus_issue", ratioFrom: Number(p.RatioFrom ?? 1), ratioTo: Number(p.RatioTo ?? 1) };
    case "RIGHTS":
      return { type: "rights_issue", ratio: String(p.Ratio ?? ""), priceKes: Number(p.PriceKes ?? 0) };
    case "BUYBACK":
      return { type: "buyback", sharesTargeted: p.SharesTargeted != null ? Number(p.SharesTargeted) : undefined, amount: p.Amount != null ? Number(p.Amount) : undefined };
    case "MERGER":
      return { type: "merger", counterparty: String(p.Counterparty ?? ""), notes: p.Notes as string | undefined };
    case "ACQUISITION":
      return { type: "acquisition", counterparty: String(p.Counterparty ?? ""), notes: p.Notes as string | undefined };
    case "SUSPENSION":
      return { type: "suspension", reason: p.Reason as string | undefined };
    case "HALT":
      return { type: "trading_halt", reason: p.Reason as string | undefined };
  }
}

export function mapCorporateAction(raw: NseRawCorporateAction, id: string): CorporateAction {
  return {
    id, securityId: securityId(raw.Symbol), type: mapActionType(raw.ActionType),
    announcedAt: raw.AnnouncedDate, exDate: raw.ExDate, recordDate: raw.RecordDate,
    payDate: raw.PayDate, effectiveDate: raw.EffectiveDate,
    details: mapActionDetails(raw),
    status: raw.Status.toLowerCase() as CorporateAction["status"],
  };
}

export function mapEarningsEvent(raw: NseRawEarningsEvent, id: string): EarningsEvent {
  return {
    id, securityId: securityId(raw.Symbol), periodId: periodId(raw.Symbol, raw.FiscalYear, raw.FiscalQuarter),
    fiscalYear: raw.FiscalYear, fiscalQuarter: raw.FiscalQuarter,
    expectedDate: raw.ExpectedDate, reportedDate: raw.ReportedDate,
    epsEstimate: raw.EpsEstimate, epsActual: raw.EpsActual,
    revenueEstimate: raw.RevenueEstimate, revenueActual: raw.RevenueActual,
  };
}

export function mapOwnership(raw: NseRawOwnership): OwnershipRecord {
  const typeMap: Record<NseRawOwnership["HolderType"], OwnershipRecord["holderType"]> = {
    INSIDER: "insider", INSTITUTION: "institution", GOVERNMENT: "government", PUBLIC: "public", OTHER: "other",
  };
  return {
    securityId: securityId(raw.Symbol), holderName: raw.HolderName, holderType: typeMap[raw.HolderType],
    sharesHeld: raw.SharesHeld, percentHeld: raw.PercentHeld, asOf: raw.AsOfDate,
  };
}