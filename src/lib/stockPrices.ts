// Single source of truth for mock NSE prices used across Home, Portfolio, TradersHub.
// Keeping these in sync prevents the Home snapshot from disagreeing with the Portfolio page.

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
  DTK: 82.00,
  SBIC: 8.90,
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
  DTK: 81.20,
  SBIC: 8.72,
};

// Trailing dividend yield (%) — used for portfolio income estimates.
export const DIV_YIELD: Record<string, number> = {
  SAFCOM: 6.4, SCOM: 6.4,
  EQTY: 8.2, KCB: 9.1, SCBK: 10.4, COOP: 6.1,
  EABL: 5.2, ABSA: 9.6, NCBA: 8.4, BAMB: 3.1,
  BRIT: 1.8, KPLC: 0.0, BAT: 11.2, JUB: 3.4,
  DTK: 4.6, SBIC: 7.5,
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
