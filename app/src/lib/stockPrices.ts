// Single source of truth for mock NSE prices used across Home, Portfolio, TradersHub,
// Markets, and Watchlist. Keeping these in sync prevents any surface from disagreeing
// with another for the same stock.
//
// The actual ticker/name/price/sector data lives in data/nseSecurities.ts, verified
// against Mansa's real /exchanges/NSE/stocks response — everything below is derived
// from that file, not hand-duplicated, so it can't drift out of sync with it again.
//
// EVERY function in this file that a component calls for a ticker's price, name,
// sector, or fundamentals resolves through data/nseSecurities.ts (directly or via
// ALIAS_OF). No other file in the app should declare its own ticker/price literal —
// if a component needs stock data, it imports a function from here instead.

import { NSE_SECURITIES, LEGACY_TICKER_ALIASES, NSE_TICKER_SET } from "@/data/nseSecurities";
export { NSE_TICKER_SET };

export const MOCK_PRICES: Record<string, number> = Object.fromEntries(
  NSE_SECURITIES.map((s) => [s.ticker, s.price])
);

// Previous close — lets every surface compute an identical "today" move.
export const PREV_CLOSE: Record<string, number> = Object.fromEntries(
  NSE_SECURITIES.map((s) => [s.ticker, s.prevClose])
);

// Trailing dividend yield (%) — used for portfolio income estimates. Mansa's
// stocks endpoint doesn't return this, so only the handful Continua has
// verified real figures for are listed; everything else correctly falls
// back to 0 via getDivYield() rather than a fabricated number.
export const DIV_YIELD: Record<string, number> = {
  SCOM: 6.4, EQTY: 8.2, KCB: 9.1, SCBK: 10.4, COOP: 6.1,
  EABL: 5.2, ABSA: 9.6, NCBA: 8.4, BRIT: 1.8, KPLC: 0.0,
  BAT: 11.2, JUB: 3.4, DTK: 4.6, SBIC: 7.5, TOTL: 4.0,
  KEGN: 2.8, CIC: 2.5, WTK: 4.8, KUKZ: 5.5, SASN: 4.1,
};

// Sector + display name — the shared metadata behind every "All Stocks" /
// screener / heatmap surface, and the canonical source for STOCK_NAMES below
// so a company's name is only ever typed out in one place (data/nseSecurities.ts).
export const STOCK_META: Record<string, { name: string; sector: string }> = Object.fromEntries(
  NSE_SECURITIES.map((s) => [s.ticker, { name: s.name, sector: s.sector }])
);

// Legacy/colloquial spellings (SAFCOM, DTB, STANBIC, KAKZ, UMEME, CARBACID,
// SAMR) still used in some UI copy — resolved transparently by
// getPrice/getStockName/getStockSector/getStockFundamentals below, so
// existing call sites using the old spelling keep working without needing
// to be individually rewritten.
export const ALIAS_OF: Record<string, string> = LEGACY_TICKER_ALIASES;
export const CANONICAL_SYMBOLS = NSE_SECURITIES.map((s) => s.ticker);

// Thin, name-only view over STOCK_META — kept so existing call sites that
// just want a label (quick-watch marquee, home widgets, etc.) don't need to
// know about sectors too. Derived, not hand-typed, so it can't drift.
export const STOCK_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STOCK_META).map(([symbol, meta]) => [symbol, meta.name])
);

/** Resolves a legacy/colloquial spelling (SAFCOM, DTB, STANBIC...) to its real
 *  Mansa ticker, or returns the input unchanged if it's already canonical (or
 *  unrecognized). Every getter below normalizes through this first — this is
 *  the ONE place that needs to know about legacy spellings, instead of every
 *  data object needing a duplicate entry for each alias. */
const resolveTicker = (symbol: string): string => {
  const key = symbol?.toUpperCase();
  return (key && ALIAS_OF[key]) || key;
};

export const getStockName = (symbol: string, fallback?: string): string => {
  const key = resolveTicker(symbol);
  return (key && STOCK_NAMES[key]) || fallback || symbol;
};

export const getStockSector = (symbol: string, fallback?: string): string => {
  const key = resolveTicker(symbol);
  return (key && STOCK_META[key]?.sector) || fallback || "Other";
};

export const getPrice = (symbol: string, fallback?: number): number => {
  const key = resolveTicker(symbol);
  if (key && MOCK_PRICES[key] != null) return MOCK_PRICES[key];
  return fallback ?? 50;
};

export const getPrevClose = (symbol: string, fallback?: number): number => {
  const key = resolveTicker(symbol);
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
  const key = resolveTicker(symbol);
  return key && DIV_YIELD[key] != null ? DIV_YIELD[key] : 0;
};

// ─────────────────────────────────────────────────────────────────────────
// Multi-range change % (1D/1W/1M/YTD) — single source for the Sector Heatmap's
// range pills and anywhere else that needs a longer-horizon move. 1D always
// comes from getDayChange (real price vs prev close). Longer ranges don't yet
// have a historical series from the data layer, so they're derived
// deterministically per symbol+range (stable across renders, never random)
// until RealNseClient exposes real historical bars.
// ─────────────────────────────────────────────────────────────────────────
export type ChangeRange = "1D" | "1W" | "1M" | "YTD";

const RANGE_SPAN: Record<Exclude<ChangeRange, "1D">, { min: number; max: number }> = {
  "1W": { min: -11, max: 11 },
  "1M": { min: -22, max: 24 },
  YTD: { min: -38, max: 55 },
};

/** Deterministic pseudo-random float in [0,1) seeded by a number — stable, not Math.random(). */
function seededUnit(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

export function getRangeChangePct(symbol: string, range: ChangeRange): number {
  if (range === "1D") return +getDayChange(symbol).pct.toFixed(2);
  const span = RANGE_SPAN[range];
  const seed = tickerSeed(symbol) * (range === "1W" ? 7 : range === "1M" ? 31 : 365);
  const pct = span.min + seededUnit(seed) * (span.max - span.min);
  return +pct.toFixed(2);
}

/** Net money flow (KES, millions) for a symbol over a range: price × volume, signed by
 *  that range's direction. Powers the heatmap's "Capital Flow" view — size/colour show
 *  where money is actually moving rather than raw % change. */
export function getMoneyFlowM(symbol: string, range: ChangeRange): number {
  const price = getPrice(symbol);
  const volumeM = parseMagnitude(getStockFundamentals(symbol).volume) / 1e6;
  const pct = getRangeChangePct(symbol, range);
  const flow = price * volumeM;
  return +(pct >= 0 ? flow : -flow).toFixed(2);
}

export interface PortfolioLike {
  symbol: string;
  shares: number;
  avg_cost: number;
}

export function computePortfolioStats(
  portfolio: PortfolioLike[],
  liveQuotes?: Record<string, { price: number; dayChangeAbs: number }>
) {
  let totalValue = 0;
  let totalCost = 0;
  let todayGain = 0;
  portfolio.forEach((h) => {
    const quote = liveQuotes?.[h.symbol.toUpperCase()];
    const price = quote?.price ?? getPrice(h.symbol, h.avg_cost);
    const dayChangeAbs = quote?.dayChangeAbs ?? getDayChange(h.symbol).abs;
    totalValue += price * h.shares;
    totalCost += h.avg_cost * h.shares;
    todayGain += dayChangeAbs * h.shares;
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
  SCOM: { marketCap: "692.9B", pe: 12.4, beta: 0.85, volume: "8.1M", avgVolume: "6.2M" },
  EQTY: { marketCap: "184.6B", pe: 8.2, beta: 1.12, volume: "2.4M", avgVolume: "1.8M" },
  KCB: { marketCap: "121.7B", pe: 6.5, beta: 1.05, volume: "1.2M", avgVolume: "980K" },
  COOP: { marketCap: "96.4B", pe: 5.8, beta: 0.92, volume: "1.5M", avgVolume: "1.1M" },
  SCBK: { marketCap: "146.5B", pe: 10.5, beta: 0.78, volume: "450K", avgVolume: "380K" },
  ABSA: { marketCap: "79.9B", pe: 7.2, beta: 0.95, volume: "890K", avgVolume: "720K" },
  NCBA: { marketCap: "83.5B", pe: 8.9, beta: 0.88, volume: "890K", avgVolume: "650K" },
  DTK: { marketCap: "38.2B", pe: 4.8, beta: 0.72, volume: "120K", avgVolume: "95K" },
  SBIC: { marketCap: "44.1B", pe: 7.2, beta: 0.82, volume: "85K", avgVolume: "68K" },
  BRIT: { marketCap: "17.9B", pe: 8.5, beta: 1.25, volume: "1.8M", avgVolume: "950K" },
  JUB: { marketCap: "16.6B", pe: 6.2, beta: 0.68, volume: "45K", avgVolume: "38K" },
  EABL: { marketCap: "128.9B", pe: 18.5, beta: 0.75, volume: "850K", avgVolume: "420K" },
  BAT: { marketCap: "38.4B", pe: 9.8, beta: 0.55, volume: "45K", avgVolume: "35K" },
  KPLC: { marketCap: "6.8B", pe: 6.5, beta: 1.45, volume: "15.2M", avgVolume: "8.5M" },
  KEGN: { marketCap: "23.1B", pe: 5.2, beta: 1.15, volume: "2.1M", avgVolume: "1.6M" },
  TOTL: { marketCap: "4.6B", pe: 12.5, beta: 0.65, volume: "95K", avgVolume: "78K" },
  PORT: { marketCap: "12.4B", pe: 15.2, beta: 0.92, volume: "340K", avgVolume: "280K" },
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
  const canonicalKey = resolveTicker(symbol);
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