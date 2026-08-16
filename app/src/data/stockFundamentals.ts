// Mock fundamentals for Continua — keyed by symbol.
// Deterministic per-symbol data driving every interactive analysis tool.

export interface Fundamentals {
  fairValue: number;
  peSector: number;
  pbSector: number;
  evEbitda: number;
  evEbitdaSector: number;
  revenueHistory: { year: string; revenue: number; earnings: number; eps: number; forecast?: boolean }[];
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

  // ▼ NEW interactive datasets
  pastReturns: { period: "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y"; company: number; sector: number; nse: number }[];
  analystTargets: { low: number; avg: number; high: number; count: number; buy: number; hold: number; sell: number };
  earningsSurprises: { quarter: string; estimate: number; actual: number }[];
  insiderTrades: { date: string; insider: string; role: string; type: "Buy" | "Sell"; shares: number; value: number }[];
  marginsHistory: { year: string; gross: number; operating: number; net: number }[];

  // ▼ Institutional research datasets
  returnsHistory: { year: string; roe: number; roa: number; roic: number }[];
  epsEstimateTrend: { month: string; est: number }[];        // last-N-month analyst EPS drift
  revenueForecast: { year: string; low: number; mid: number; high: number; actual?: number }[];
  revenueSegments: { name: string; value: number; color: string }[];
  geographicRevenue: { region: string; value: number; color: string }[];
  freeCashFlowTrend: { year: string; fcf: number; capex: number }[];
  shareCount: { year: string; shares: number }[];            // dilution history (billions)
  piotroski: { score: number; checks: { label: string; ok: boolean }[] };
  altmanZ: { score: number; band: "safe" | "grey" | "distress" };
  volatility: { period: string; company: number; sector: number }[];
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
  const baseShares = r(2, 8, 60) * 1e9;

  const revHist = [
    { year: "2018", revenue: baseRev * 0.62 },
    { year: "2019", revenue: baseRev * 0.69 },
    { year: "2020", revenue: baseRev * 0.72 },
    { year: "2021", revenue: baseRev * 0.78 },
    { year: "2022", revenue: baseRev * 0.86 },
    { year: "2023", revenue: baseRev * 0.94 },
    { year: "2024", revenue: baseRev },
    { year: "2025E", revenue: baseRev * 1.09, forecast: true },
    { year: "2026E", revenue: baseRev * 1.18, forecast: true },
    { year: "2027E", revenue: baseRev * 1.27, forecast: true },
  ].map(x => {
    const earnings = x.revenue * r(0.16, 0.24, x.year.charCodeAt(2));
    return { ...x, earnings, eps: +(earnings / baseShares).toFixed(2) };
  });

  return {
    fairValue: 0,
    peSector: r(8, 14),
    pbSector: r(1, 3, 1),
    evEbitda: r(5, 12, 2),
    evEbitdaSector: r(7, 11, 3),
    revenueHistory: revHist,
    growthMetrics: [
      { label: "Revenue (3yr CAGR)", value: r(8, 22, 4), sector: r(6, 11, 5) },
      { label: "Earnings (3yr CAGR)", value: r(6, 18, 6), sector: r(5, 10, 7) },
      { label: "Forecast revenue (1yr)", value: r(4, 14, 8), sector: r(4, 8, 9) },
      { label: "Forecast EPS (1yr)", value: r(5, 16, 10), sector: r(3, 9, 11) },
    ],
    cashVsDebt: Array.from({ length: 10 }, (_, i) => ({
      year: `${2015 + i}`,
      cash: r(10, 60, 12 + i) * 1e9,
      debt: r(12, 55, 30 + i) * 1e9,
    })),
    operatingCashFlow: Array.from({ length: 10 }, (_, i) => ({
      year: `${2015 + i}`,
      cf: r(6, 40, 20 + i) * 1e9,
    })),
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
    pastReturns: [
      { period: "1M", company: r(-8, 12, 70), sector: r(-5, 8, 71), nse: r(-4, 6, 72) },
      { period: "3M", company: r(-12, 20, 73), sector: r(-8, 14, 74), nse: r(-6, 10, 75) },
      { period: "6M", company: r(-15, 28, 76), sector: r(-10, 18, 77), nse: r(-8, 14, 78) },
      { period: "1Y", company: r(-20, 45, 79), sector: r(-12, 25, 80), nse: r(-10, 18, 81) },
      { period: "3Y", company: r(-25, 90, 82), sector: r(-15, 55, 83), nse: r(-12, 40, 84) },
      { period: "5Y", company: r(-30, 150, 85), sector: r(-20, 90, 86), nse: r(-15, 60, 87) },
    ],
    analystTargets: (() => {
      const avg = r(0.85, 1.25, 90);
      return {
        low: +(avg * 0.78).toFixed(2),
        avg: +avg.toFixed(2),
        high: +(avg * 1.28).toFixed(2),
        count: Math.floor(r(6, 18, 91)),
        buy: Math.floor(r(4, 12, 92)),
        hold: Math.floor(r(1, 5, 93)),
        sell: Math.floor(r(0, 3, 94)),
      };
    })(),
    earningsSurprises: Array.from({ length: 8 }, (_, i) => {
      const est = r(0.4, 2.5, 100 + i);
      const beat = r(-0.15, 0.18, 110 + i);
      return {
        quarter: `Q${(i % 4) + 1} ${2023 + Math.floor(i / 4)}`,
        estimate: +est.toFixed(2),
        actual: +(est * (1 + beat)).toFixed(2),
      };
    }),
    insiderTrades: [
      { date: "2025-09-12", insider: "James Mwangi", role: "CEO", type: "Buy", shares: 50000, value: r(2, 10, 120) * 1e6 },
      { date: "2025-08-04", insider: "Mary Wamae", role: "CFO", type: "Sell", shares: 18000, value: r(1, 5, 121) * 1e6 },
      { date: "2025-06-21", insider: "Peter Ndegwa", role: "Director", type: "Buy", shares: 22000, value: r(1, 6, 122) * 1e6 },
      { date: "2025-05-09", insider: "Polycarp Igathe", role: "Director", type: "Buy", shares: 8000, value: r(0.3, 2, 123) * 1e6 },
      { date: "2025-03-15", insider: "Susan Mudhune", role: "Chair", type: "Sell", shares: 12000, value: r(0.5, 3, 124) * 1e6 },
    ],
    marginsHistory: Array.from({ length: 6 }, (_, i) => ({
      year: `${2019 + i}`,
      gross: r(35, 55, 130 + i),
      operating: r(18, 32, 140 + i),
      net: r(8, 22, 150 + i),
    })),

    returnsHistory: Array.from({ length: 6 }, (_, i) => ({
      year: `${2019 + i}`,
      roe: r(8, 28, 160 + i),
      roa: r(3, 14, 170 + i),
      roic: r(6, 22, 180 + i),
    })),
    epsEstimateTrend: Array.from({ length: 12 }, (_, i) => {
      const base = r(1.2, 2.4, 190);
      const drift = ((r(0, 1, 200 + i) - 0.5) * 0.06) * (i / 6);
      return { month: `M${i - 11}`, est: +(base + drift).toFixed(2) };
    }),
    revenueForecast: (() => {
      const baseline = r(60, 140, 210);
      return Array.from({ length: 6 }, (_, i) => {
        const yr = 2022 + i;
        const grow = 1 + i * 0.08;
        const mid = +(baseline * grow).toFixed(1);
        const spread = mid * 0.08;
        const isActual = yr <= 2024;
        return {
          year: `${yr}${isActual ? "" : "E"}`,
          low: +(mid - spread).toFixed(1),
          mid,
          high: +(mid + spread).toFixed(1),
          actual: isActual ? +(mid + (r(-0.04, 0.04, 220 + i) * mid)).toFixed(1) : undefined,
        };
      });
    })(),
    revenueSegments: [
      { name: "M-Pesa", value: r(30, 45, 230), color: "#10b981" },
      { name: "Mobile Data", value: r(18, 28, 231), color: "#3b82f6" },
      { name: "Voice", value: r(12, 22, 232), color: "#8b5cf6" },
      { name: "Fixed & Fibre", value: r(6, 12, 233), color: "#f97316" },
      { name: "Other", value: r(3, 8, 234), color: "#94a3b8" },
    ],
    geographicRevenue: [
      { region: "Kenya", value: r(60, 78, 240), color: "#3b82f6" },
      { region: "Ethiopia", value: r(6, 14, 241), color: "#10b981" },
      { region: "Tanzania", value: r(4, 9, 242), color: "#f97316" },
      { region: "Uganda", value: r(3, 8, 243), color: "#8b5cf6" },
      { region: "Rest of Africa", value: r(2, 6, 244), color: "#94a3b8" },
    ],
    freeCashFlowTrend: Array.from({ length: 8 }, (_, i) => ({
      year: `${2017 + i}`,
      fcf: +r(4, 30, 250 + i).toFixed(1),
      capex: +r(3, 18, 260 + i).toFixed(1),
    })),
    shareCount: Array.from({ length: 8 }, (_, i) => ({
      year: `${2017 + i}`,
      shares: +(r(3.8, 4.2, 270 + i)).toFixed(2),
    })),
    piotroski: (() => {
      const checks = [
        { label: "Positive net income", ok: r(0, 1, 280) > 0.2 },
        { label: "Positive operating cash flow", ok: r(0, 1, 281) > 0.2 },
        { label: "ROA improving YoY", ok: r(0, 1, 282) > 0.4 },
        { label: "OCF > net income", ok: r(0, 1, 283) > 0.3 },
        { label: "Lower long-term debt YoY", ok: r(0, 1, 284) > 0.5 },
        { label: "Higher current ratio YoY", ok: r(0, 1, 285) > 0.4 },
        { label: "No new share dilution", ok: r(0, 1, 286) > 0.4 },
        { label: "Gross margin improving", ok: r(0, 1, 287) > 0.4 },
        { label: "Asset turnover improving", ok: r(0, 1, 288) > 0.4 },
      ];
      return { score: checks.filter(c => c.ok).length, checks };
    })(),
    altmanZ: (() => {
      const s = +r(1.4, 4.2, 290).toFixed(2);
      return { score: s, band: s > 2.99 ? "safe" : s > 1.81 ? "grey" : "distress" };
    })(),
    volatility: [
      { period: "30D", company: r(12, 32, 300), sector: r(10, 22, 301) },
      { period: "90D", company: r(14, 36, 302), sector: r(12, 24, 303) },
      { period: "1Y",  company: r(18, 42, 304), sector: r(14, 28, 305) },
      { period: "3Y",  company: r(22, 46, 306), sector: r(16, 30, 307) },
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
  // scale analyst targets around live price
  f.analystTargets = {
    ...f.analystTargets,
    low: +(price * 0.82).toFixed(2),
    avg: +(price * f.analystTargets.avg).toFixed(2),
    high: +(price * 1.25).toFixed(2),
  };
  cache.set(key, f);
  return f;
}