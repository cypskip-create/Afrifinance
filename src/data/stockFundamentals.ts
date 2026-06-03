// Mock fundamentals for AfriFinance — keyed by symbol.
// All values are illustrative and should be replaced with a real data feed.

export interface Fundamentals {
  fairValue: number;
  peSector: number;
  pbSector: number;
  evEbitda: number;
  evEbitdaSector: number;
  revenueHistory: { year: string; revenue: number; earnings: number; forecast?: boolean }[];
  growthMetrics: { label: string; value: number; sector: number }[];
  cashVsDebt: { year: string; cash: number; debt: number }[];
  operatingCashFlow: { year: string; cf: number }[];
  healthChecks: { label: string; ok: boolean }[];
  dividendHistory: { year: string; dps: number }[];
  payoutRatio: number;
  dividendChecks: { label: string; ok: boolean }[];
  ownership: { name: string; value: number; color: string }[];
  topShareholders: { name: string; type: string; pct: number }[];
  riskFactors: { label: string; level: "Low" | "Medium" | "High"; note: string }[];
  events: { date: string; title: string; type: "earnings" | "dividend" | "agm" | "other" }[];
}

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  bull: "hsl(var(--bull))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  muted: "hsl(var(--muted-foreground))",
};

function build(seed: number): Fundamentals {
  const r = (min: number, max: number, offset = 0) =>
    +(min + ((Math.sin(seed + offset) + 1) / 2) * (max - min)).toFixed(2);
  const baseRev = r(20, 120) * 1e9;

  return {
    fairValue: 0,
    peSector: r(8, 14),
    pbSector: r(1, 3, 1),
    evEbitda: r(5, 12, 2),
    evEbitdaSector: r(7, 11, 3),
    revenueHistory: [
      { year: "2021", revenue: baseRev * 0.78, earnings: baseRev * 0.78 * 0.18 },
      { year: "2022", revenue: baseRev * 0.86, earnings: baseRev * 0.86 * 0.19 },
      { year: "2023", revenue: baseRev * 0.94, earnings: baseRev * 0.94 * 0.21 },
      { year: "2024", revenue: baseRev, earnings: baseRev * 0.22 },
      { year: "2025E", revenue: baseRev * 1.09, earnings: baseRev * 1.09 * 0.23, forecast: true },
      { year: "2026E", revenue: baseRev * 1.18, earnings: baseRev * 1.18 * 0.24, forecast: true },
      { year: "2027E", revenue: baseRev * 1.27, earnings: baseRev * 1.27 * 0.25, forecast: true },
    ],
    growthMetrics: [
      { label: "Revenue (3yr CAGR)", value: r(8, 22, 4), sector: r(6, 11, 5) },
      { label: "Earnings (3yr CAGR)", value: r(6, 18, 6), sector: r(5, 10, 7) },
      { label: "Forecast revenue (1yr)", value: r(4, 14, 8), sector: r(4, 8, 9) },
      { label: "Forecast EPS (1yr)", value: r(5, 16, 10), sector: r(3, 9, 11) },
    ],
    cashVsDebt: [
      { year: "2021", cash: r(10, 40, 12) * 1e9, debt: r(20, 60, 13) * 1e9 },
      { year: "2022", cash: r(15, 45, 14) * 1e9, debt: r(18, 55, 15) * 1e9 },
      { year: "2023", cash: r(20, 50, 16) * 1e9, debt: r(15, 50, 17) * 1e9 },
      { year: "2024", cash: r(25, 60, 18) * 1e9, debt: r(12, 45, 19) * 1e9 },
    ],
    operatingCashFlow: [
      { year: "2020", cf: r(8, 25, 20) * 1e9 },
      { year: "2021", cf: r(10, 28, 21) * 1e9 },
      { year: "2022", cf: r(12, 32, 22) * 1e9 },
      { year: "2023", cf: r(14, 36, 23) * 1e9 },
      { year: "2024", cf: r(16, 40, 24) * 1e9 },
    ],
    healthChecks: [
      { label: "Short-term assets cover short-term liabilities", ok: true },
      { label: "Debt-to-equity below sector average", ok: r(0, 1, 25) > 0.4 },
      { label: "Operating cash flow positive 5 yrs", ok: true },
      { label: "Interest payments well covered (>3x)", ok: r(0, 1, 26) > 0.3 },
      { label: "Profitable last 3 years", ok: r(0, 1, 27) > 0.2 },
    ],
    dividendHistory: Array.from({ length: 10 }, (_, i) => ({
      year: `${2015 + i}`,
      dps: +(r(0.4, 3.5, 28 + i)).toFixed(2),
    })),
    payoutRatio: r(20, 75, 40),
    dividendChecks: [
      { label: "Dividend coverage > 1.5x", ok: true },
      { label: "Stable dividend last 10 years", ok: r(0, 1, 41) > 0.3 },
      { label: "Growing dividend per share", ok: r(0, 1, 42) > 0.4 },
      { label: "Yield above market average", ok: r(0, 1, 43) > 0.5 },
    ],
    ownership: [
      { name: "Institutional", value: r(35, 60, 44), color: COLORS.primary },
      { name: "Public", value: r(20, 40, 45), color: COLORS.accent },
      { name: "Insiders", value: r(3, 15, 46), color: COLORS.bull },
      { name: "Government", value: r(2, 10, 47), color: COLORS.chart3 },
    ],
    topShareholders: [
      { name: "Vodafone Group", type: "Strategic", pct: r(20, 35, 48) },
      { name: "Government of Kenya", type: "Government", pct: r(15, 30, 49) },
      { name: "NSSF Kenya", type: "Pension Fund", pct: r(4, 10, 50) },
      { name: "Britam Asset Managers", type: "Institutional", pct: r(2, 7, 51) },
      { name: "Stanlib Kenya", type: "Institutional", pct: r(1, 5, 52) },
    ],
    riskFactors: [
      { label: "Earnings volatility", level: r(0, 1, 53) > 0.5 ? "Low" : "Medium", note: "Earnings vary less than NSE peers" },
      { label: "Debt risk", level: r(0, 1, 54) > 0.6 ? "Low" : "Medium", note: "Debt covered by operating cash flow" },
      { label: "Regulatory exposure", level: r(0, 1, 55) > 0.7 ? "Low" : "Medium", note: "Operates in regulated sector" },
      { label: "Concentration risk", level: r(0, 1, 56) > 0.5 ? "Low" : "Medium", note: "Revenue diversified across products" },
      { label: "Liquidity risk", level: "Low", note: "Actively traded on NSE main board" },
    ],
    events: [
      { date: "Dec 15", title: "Q3 earnings release", type: "earnings" },
      { date: "Dec 22", title: "Ex-dividend date", type: "dividend" },
      { date: "Jan 18", title: "Annual General Meeting", type: "agm" },
      { date: "Feb 02", title: "FY results presentation", type: "earnings" },
    ],
  };
}

const cache = new Map<string, Fundamentals>();

export function getFundamentals(symbol: string, price: number): Fundamentals {
  const key = symbol.toUpperCase();
  if (cache.has(key)) {
    const f = cache.get(key)!;
    return { ...f, fairValue: price * (1 + ((f.peSector - f.evEbitda) / 30)) };
  }
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i) * (i + 1);
  const f = build(seed);
  f.fairValue = price * (1 + ((f.peSector - f.evEbitda) / 30));
  cache.set(key, f);
  return f;
}
