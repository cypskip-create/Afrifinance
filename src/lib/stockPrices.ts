// Single source of truth for mock NSE prices used across Home, Portfolio, TradersHub,
// Markets, and Watchlist. Keeping these in sync prevents any surface from disagreeing
// with another for the same stock.

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
  DTK: 81.20,
  SBIC: 8.72,
  TOTL: 23.47, ARM: 4.12, NBK: 5.88, KEGN: 3.38, UMEME: 9.06,
  CIC: 2.20, KENO: 12.20, WTK: 145.45, KAKZ: 267.90, SASN: 18.00,
  EGAD: 12.18, TCL: 1.70, SAMR: 3.30, NSE: 8.40, CARBACID: 12.00,
};

// Sector + display name — the shared metadata behind every "All Stocks" / screener / heatmap surface.
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
  SBIC: { name: "Stanbic Holdings", sector: "Banking" },
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

// Trailing dividend yield (%) — used for portfolio income estimates.
export const DIV_YIELD: Record<string, number> = {
  SAFCOM: 6.4, SCOM: 6.4,
  EQTY: 8.2, KCB: 9.1, SCBK: 10.4, COOP: 6.1,
  EABL: 5.2, ABSA: 9.6, NCBA: 8.4, BAMB: 3.1,
  BRIT: 1.8, KPLC: 0.0, BAT: 11.2, JUB: 3.4,
  DTK: 4.6, SBIC: 7.5,
  TOTL: 4.0, ARM: 0.0, NBK: 0.0, KEGN: 2.8, UMEME: 3.5,
  CIC: 2.5, KENO: 3.2, WTK: 4.8, KAKZ: 5.5, SASN: 4.1,
  EGAD: 0.0, TCL: 0.0, SAMR: 0.0, NSE: 3.0, CARBACID: 6.5,
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