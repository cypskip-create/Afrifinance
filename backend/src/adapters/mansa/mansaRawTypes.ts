/**
 * Raw shapes as Mansa API (mansaapi.com) actually returns them. Nothing
 * outside adapters/mansa/ should ever import from here — same rule as
 * adapters/nse/nseRawTypes.ts. Field names below match the documented
 * examples at https://mansaapi.com/docs exactly (as of the "May 2026"
 * changelog entry, NGX ETF/index endpoints being the newest addition).
 */

export interface MansaStock {
  ticker: string;
  name: string;
  sector: string | null;
  exchange: string;
  currency: string;
  isin?: string | null;
  status?: string | null;         // not consistently present; see mapStatus fallback
  previous_close: number;
  open: number;
  high: number;
  low: number;
  close: number;                  // last traded price
  change: number;
  change_pct: number;
  volume: number;
  market_cap?: number | null;
  updated_at: string;             // ISO 8601
}

export interface MansaStockListResponse {
  success: boolean;
  data: MansaStock[];
  meta?: { exchange?: string; count?: number };
}

export interface MansaStockDetailResponse {
  success: boolean;
  data: MansaStock;
}

export interface MansaHistoryPoint {
  date: string;                   // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  adj_close: number;
  volume: number | null;
}

export interface MansaHistoryResponse {
  success: boolean;
  data: {
    exchange: string;
    ticker: string;
    currency: string;
    price_unit: "major" | "cents";
    points: MansaHistoryPoint[];
  };
  meta: { count: number; first_date: string; last_date: string; order: string; data_freshness: string };
}

export interface MansaFundamentalsFigures {
  revenue: number | null;
  gross_profit: number | null;
  operating_profit: number | null;
  profit_before_tax: number | null;
  profit_after_tax: number | null;
  total_assets: number | null;
  total_equity: number | null;
  total_liabilities: number | null;
  eps_basic: number | null;
  dividend_per_share: number | null;
}

export interface MansaFundamentalsPeriod {
  fiscal_period: string;           // e.g. "FY2025"
  period_end_date: string;         // ISO date
  statement_type: "annual" | "quarterly";
  currency: string;
  figures: MansaFundamentalsFigures;
  derived: {
    net_margin_pct: number | null;
    roe_pct: number | null;
    roa_pct: number | null;
    payout_ratio_pct: number | null;
    pe: number | null;
    dividend_yield_pct: number | null;
  };
  source_document_url?: string;
  verified_at?: string;
}

export interface MansaFundamentalsResponse {
  success: boolean;
  data: {
    ticker: string;
    exchange: string;
    company_name: string;
    live_price_used_for_ratios: number;
    periods: MansaFundamentalsPeriod[];
  };
}

export interface MansaDividendRecord {
  ex_dividend_date: string;
  record_date: string;
  pay_date: string;
  dividend_per_share: number;
  currency: string;
}

export interface MansaDividendsResponse {
  success: boolean;
  symbol: string;
  count: number;
  latest_ex_dividend_date: string | null;
  history: MansaDividendRecord[];
}

export interface MansaExchangeMeta {
  code: string;
  name: string;
  country: string;
  market_type?: string;
  timezone?: string;
  website?: string;
}

export interface MansaExchangeMetadataResponse {
  success: boolean;
  data: MansaExchangeMeta[];
}

export interface MansaIndex {
  code: string;               // 'NGX30', 'ALSI', 'GSE-CI', ...
  name: string;
  exchange: string;
  value: number;
  previous_close: number;
  change: number;
  change_pct: number;
  currency: string;
  updated_at: string;
}

export interface MansaIndexListResponse {
  success: boolean;
  data: MansaIndex[];
}