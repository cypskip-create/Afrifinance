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

export const getPrice = (symbol: string, fallback?: number): number => {
  const key = symbol?.toUpperCase();
  if (key && MOCK_PRICES[key] != null) return MOCK_PRICES[key];
  return fallback ?? 50;
};

export interface PortfolioLike {
  symbol: string;
  shares: number;
  avg_cost: number;
}

export function computePortfolioStats(portfolio: PortfolioLike[]) {
  let totalValue = 0;
  let totalCost = 0;
  portfolio.forEach((h) => {
    totalValue += getPrice(h.symbol, h.avg_cost) * h.shares;
    totalCost += h.avg_cost * h.shares;
  });
  const totalGain = totalValue - totalCost;
  const gainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  return { totalValue, totalCost, totalGain, gainPct };
}
