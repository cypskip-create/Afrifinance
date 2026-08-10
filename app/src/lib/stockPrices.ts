// Single source of truth for mock NSE prices used across Home, Portfolio, TradersHub,
// Markets, and Watchlist. Keeping these in sync prevents any surface from disagreeing
// with another for the same stock.
//
// NOTE: some pages (e.g. StockDetail) key their own display data by a different
// ticker alias for the same company (STANBIC vs SBIC, DTB vs DTK). Both aliases
// are kept in sync below so getPrice()/getDivYield() never silently return the
// "not found" fallback just because a different part of the app used the other
// spelling of the symbol.

export const MOCK_PRICES: Record<string, number> = {
  SAFCOM: 17.85, SCOM: 17.85,
  EQTY: 48.50,
  KCB: 38.20,
  SCBK: 215.75,
  COOP: 16.45,
  EABL: 165.50,
  ABSA: 17.10,
  NCBA: 49.85,
  BAMB: 38.95,
  BRIT: 5.42,
  KPLC: 4.18,
  BAT: 320.00,
  JUB: 380.00,
  DTK: 82.00, DTB: 82.00,
  SBIC: 8.90, STANBIC: 8.90,
  // Additional NSE-listed companies
  TOTL: 22.50, ARM: 4.25, NBK: 5.85, KEGN: 3.45, UMEME: 8.90,
  CIC: 2.15, KENO: 12.40, WTK: 145.00, KAKZ: 280.00, SASN: 18.50,
  EGAD: 12.00, TCL: 1.85, SAMR: 3.20, NSE: 8.50, CARBACID: 11.85,
};

// Previous close — lets every surface compute an identical "today" move.
export const PREV_CLOSE: Record<string, number> = {
  SAFCOM: 17.55, SCOM: 17.55,
  EQTY: 49.10,
  KCB: 37.80,
  SCBK: 213.00,
  COOP: 16.55,
  EABL: 167.25,
  ABSA: 16.90,
  NCBA: 49.20,
  BAMB: 39.40,
  BRIT: 5.30,
  KPLC: 4.25,
  BAT: 316.50,
  JUB: 384.00,
  DTK: 81.20, DTB: 81.20,
  SBIC: 8.72, STANBIC: 8.72,
  TOTL: 23.47, ARM: 4.12, NBK: 5.88, KEGN: 3.38, UMEME: 9.06,
  CIC: 2.20, KENO: 12.20, WTK: 145.45, KAKZ: 267.90, SASN: 18.00,
  EGAD: 12.18, TCL: 1.70, SAMR: 3.30, NSE: 8.40, CARBACID: 12.00,
};

// Trailing dividend yield (%) — used for portfolio income estimates.
export const DIV_YIELD: Record<string, number> = {
  SAFCOM: 6.4, SCOM: 6.4,
  EQTY: 8.2, KCB: 9.1, SCBK: 10.4, COOP: 6.1,
  EABL: 5.2, ABSA: 9.6, NCBA: 8.4, BAMB: 3.1,
  BRIT: 1.8, KPLC: 0.0, BAT: 11.2, JUB: 3.4,
  DTK: 4.6, DTB: 4.6,
  SBIC: 7.5, STANBIC: 7.5,
  TOTL: 4.0, ARM: 0.0, NBK: 0.0, KEGN: 2.8, UMEME: 3.5,
  CIC: 2.5, KENO: 3.2, WTK: 4.8, KAKZ: 5.5, SASN: 4.1,
  EGAD: 0.0, TCL: 0.0, SAMR: 0.0, NSE: 3.0, CARBACID: 6.5,
};

// Sector + display name — the shared metadata behind every "All Stocks" /
// screener / heatmap surface, and the canonical source for STOCK_NAMES below
// so a company's name is only ever typed out in one place.
export const STOCK_META: Record<string, { name: string; sector: string }> = {
  SAFCOM: { name: "Safaricom PLC", sector: "Telecommunications" },
  SCOM: { name: "Safaricom PLC", sector: "Telecommunications" },
  EQTY: { name: "Equity Group Holdings", sector: "Banking" },
  KCB: { name: "KCB Group", sector: "Banking" },
  SCBK: { name: "Standard Chartered Bank Kenya", sector: "Banking" },
  COOP: { name: "Co-operative Bank of Kenya", sector: "Banking" },
  EABL: { name: "East African Breweries", sector: "Manufacturing" },
  ABSA: { name: "ABSA Bank Kenya", sector: "Banking" },
  NCBA: { name: "NCBA Group", sector: "Banking" },
  BAMB: { name: "Bamburi Cement", sector: "Construction" },
  BRIT: { name: "Britam Holdings", sector: "Insurance" },
  KPLC: { name: "Kenya Power", sector: "Energy" },
  BAT: { name: "BAT Kenya", sector: "Manufacturing" },
  JUB: { name: "Jubilee Holdings", sector: "Insurance" },
  DTK: { name: "Diamond Trust Bank", sector: "Banking" },
  DTB: { name: "Diamond Trust Bank", sector: "Banking" },
  SBIC: { name: "Stanbic Holdings", sector: "Banking" },
  STANBIC: { name: "Stanbic Holdings", sector: "Banking" },
  TOTL: { name: "TotalEnergies Marketing Kenya", sector: "Energy" },
  ARM: { name: "ARM Cement", sector: "Construction" },
  NBK: { name: "National Bank of Kenya", sector: "Banking" },
  KEGN: { name: "KenGen", sector: "Energy" },
  UMEME: { name: "Umeme Ltd", sector: "Energy" },
  CIC: { name: "CIC Insurance Group", sector: "Insurance" },
  KENO: { name: "KenolKobil", sector: "Energy" },
  WTK: { name: "Williamson Tea", sector: "Agriculture" },
  KAKZ: { name: "Kakuzi", sector: "Agriculture" },
  SASN: { name: "Sasini", sector: "Agriculture" },
  EGAD: { name: "Eaagads", sector: "Agriculture" },
  TCL: { name: "Trans-Century", sector: "Industrials" },
  SAMR: { name: "Sameer Africa", sector: "Industrials" },
  NSE: { name: "Nairobi Securities Exchange PLC", sector: "Financial Services" },
  CARBACID: { name: "Carbacid Investments", sector: "Manufacturing" },
};

// Some companies have two ticker aliases in STOCK_META (SAFCOM/SCOM, DTB/DTK,
// STANBIC/SBIC) so getPrice()/getStockSector() resolve either spelling. But any
// surface that lists "every NSE stock" (All Stocks, Screener, Compare, Top
// Gainers/Losers, heatmaps) must show each company exactly once — iterating
// STOCK_META directly double-lists those three companies. Use CANONICAL_SYMBOLS
// for anything that enumerates the whole market.
export const ALIAS_OF: Record<string, string> = { SCOM: "SAFCOM", DTK: "DTB", SBIC: "STANBIC" };
export const CANONICAL_SYMBOLS = Object.keys(STOCK_META).filter(s => !ALIAS_OF[s]);

// Thin, name-only view over STOCK_META — kept so existing call sites that
// just want a label (quick-watch marquee, home widgets, etc.) don't need to
// know about sectors too. Derived, not hand-typed, so it can't drift.
export const STOCK_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STOCK_META).map(([symbol, meta]) => [symbol, meta.name])
);

export const getStockName = (symbol: string, fallback?: string): string => {
  const key = symbol?.toUpperCase();
  return (key && STOCK_NAMES[key]) || fallback || symbol;
};

export const getStockSector = (symbol: string, fallback?: string): string => {
  const key = symbol?.toUpperCase();
  return (key && STOCK_META[key]?.sector) || fallback || "Other";
};

export const getPrice = (symbol: string, fallback?: number): number => {
  const key = symbol?.toUpperCase();
  if (key && MOCK_PRICES[key] != null) return MOCK_PRICES[key];
  return fallback ?? 50;
};

export const getPrevClose = (symbol: string, fallback?: number): number => {
  const key = symbol?.toUpperCase();
  if (key && PREV_CLOSE[key] != null) return PREV_CLOSE[key];
  return getPrice(symbol, fallback);
};

/** Today's move for a symbol, derived from price vs previous close. */
export const getDayChange = (symbol: string) => {
  const price = getPrice(symbol);
  const prev = getPrevClose(symbol);
  const abs = price - prev;
  return { abs, pct: prev > 0 ? (abs / prev) * 100 : 0 };
};

export const getDivYield = (symbol: string): number => {
  const key = symbol?.toUpperCase();
  return key && DIV_YIELD[key] != null ? DIV_YIELD[key] : 0;
};

export interface PortfolioLike {
  symbol: string;
  shares: number;
  avg_cost: number;
}

export function computePortfolioStats(portfolio: PortfolioLike[]) {
  let totalValue = 0;
  let totalCost = 0;
  let todayGain = 0;
  portfolio.forEach((h) => {
    totalValue += getPrice(h.symbol, h.avg_cost) * h.shares;
    totalCost += h.avg_cost * h.shares;
    todayGain += getDayChange(h.symbol).abs * h.shares;
  });
  const totalGain = totalValue - totalCost;
  const gainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const prevValue = totalValue - todayGain;
  const todayPct = prevValue > 0 ? (todayGain / prevValue) * 100 : 0;
  return { totalValue, totalCost, totalGain, gainPct, todayGain, todayPct };
}

// ─────────────────────────────────────────────────────────────────────────
// Extended per-symbol stats (market cap, P/E, beta, volume) — the single
// source for every "key stats" grid across StockDetail, the Screener, and
// Compare. Price/change are never duplicated here (they always come from
// getPrice/getDayChange above), so a ticker's numbers can't disagree between
// its detail page and any list that links to it.
// ─────────────────────────────────────────────────────────────────────────

export interface StockFundamentals {
  marketCap: string;
  pe: number;
  beta: number;
  volume: string;
  avgVolume: string;
}

/** Stable per-symbol seed for deterministic (but plausible) mock stats. */
export const tickerSeed = (s: string): number =>
  s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

// Hand-tuned figures for the stocks people actually look at — kept realistic.
// Every other NSE-listed symbol in STOCK_META still gets a fully-formed,
// deterministic set of stats generated below, so no ticker ever falls back to
// "N/A" / KES 0.00 just because it wasn't manually curated.
const HAND_TUNED_FUNDAMENTALS: Record<string, StockFundamentals> = {
  SAFCOM: { marketCap: "692.9B", pe: 12.4, beta: 0.85, volume: "8.1M", avgVolume: "6.2M" },
  EQTY: { marketCap: "184.6B", pe: 8.2, beta: 1.12, volume: "2.4M", avgVolume: "1.8M" },
  KCB: { marketCap: "121.7B", pe: 6.5, beta: 1.05, volume: "1.2M", avgVolume: "980K" },
  COOP: { marketCap: "96.4B", pe: 5.8, beta: 0.92, volume: "1.5M", avgVolume: "1.1M" },
  SCBK: { marketCap: "146.5B", pe: 10.5, beta: 0.78, volume: "450K", avgVolume: "380K" },
  ABSA: { marketCap: "79.9B", pe: 7.2, beta: 0.95, volume: "890K", avgVolume: "720K" },
  NCBA: { marketCap: "83.5B", pe: 8.9, beta: 0.88, volume: "890K", avgVolume: "650K" },
  DTB: { marketCap: "38.2B", pe: 4.8, beta: 0.72, volume: "120K", avgVolume: "95K" },
  STANBIC: { marketCap: "44.1B", pe: 7.2, beta: 0.82, volume: "85K", avgVolume: "68K" },
  BRIT: { marketCap: "17.9B", pe: 8.5, beta: 1.25, volume: "1.8M", avgVolume: "950K" },
  JUB: { marketCap: "16.6B", pe: 6.2, beta: 0.68, volume: "45K", avgVolume: "38K" },
  EABL: { marketCap: "128.9B", pe: 18.5, beta: 0.75, volume: "850K", avgVolume: "420K" },
  BAT: { marketCap: "38.4B", pe: 9.8, beta: 0.55, volume: "45K", avgVolume: "35K" },
  KPLC: { marketCap: "6.8B", pe: 6.5, beta: 1.45, volume: "15.2M", avgVolume: "8.5M" },
  KEGN: { marketCap: "23.1B", pe: 5.2, beta: 1.15, volume: "2.1M", avgVolume: "1.6M" },
  TOTL: { marketCap: "4.6B", pe: 12.5, beta: 0.65, volume: "95K", avgVolume: "78K" },
  BAMB: { marketCap: "12.4B", pe: 15.2, beta: 0.92, volume: "340K", avgVolume: "280K" },
};

/** Deterministic, plausible fundamentals for any NSE symbol not hand-tuned above. */
function generateFundamentals(symbol: string): StockFundamentals {
  const price = getPrice(symbol);
  const seed = tickerSeed(symbol);
  const pe = +(6 + (seed % 16)).toFixed(1);
  const sharesOutstandingB = 0.3 + (seed % 40) / 10; // 0.3B–4.3B shares — plausible for small/mid caps
  const marketCapB = price * sharesOutstandingB;
  const marketCap = marketCapB >= 1000 ? `${(marketCapB / 1000).toFixed(1)}T` : `${marketCapB.toFixed(1)}B`;
  return {
    marketCap,
    pe,
    beta: +(0.6 + (seed % 90) / 100).toFixed(2),
    volume: `${(0.05 + (seed % 150) / 100).toFixed(2)}M`,
    avgVolume: `${(0.04 + (seed % 120) / 100).toFixed(2)}M`,
  };
}

const fundamentalsCache = new Map<string, StockFundamentals>();

export function getStockFundamentals(symbol: string): StockFundamentals {
  const key = (symbol || "").toUpperCase();
  const canonicalKey = ALIAS_OF[key] || key;
  if (HAND_TUNED_FUNDAMENTALS[canonicalKey]) return HAND_TUNED_FUNDAMENTALS[canonicalKey];
  if (fundamentalsCache.has(canonicalKey)) return fundamentalsCache.get(canonicalKey)!;
  const f = generateFundamentals(canonicalKey);
  fundamentalsCache.set(canonicalKey, f);
  return f;
}

/** Parses magnitude-suffixed strings ("1.2T", "285B", "850K") into a comparable number.
 *  Plain parseFloat() silently drops the K/M/B/T suffix, which breaks any sort that
 *  compares two of these strings — use this instead whenever sorting/ranking by
 *  market cap or volume. */
export function parseMagnitude(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const match = value.trim().match(/^([\d.]+)\s*([KMBT])?$/i);
  if (!match) return parseFloat(value) || 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  const mult = suffix === "T" ? 1e12 : suffix === "B" ? 1e9 : suffix === "M" ? 1e6 : suffix === "K" ? 1e3 : 1;
  return num * mult;
}

/** A date N days from "now", so mock calendars (earnings, dividends, IPOs) always
 *  read as current/upcoming instead of drifting into the past as real time passes. */
export function relativeDate(daysOffset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d;
}