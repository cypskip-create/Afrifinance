import { useState } from "react";
import { InfoTip } from "./InfoTip";
import { MetricDotPlot } from "./MetricDotPlot";
import type { ResearchBundle } from "@/api/types";
import type { ValuationResult } from "@/api/valuationApi";
import type { BenchmarkAverages } from "@/hooks/useMarketBenchmark";
import type { GrowthFigures } from "@/hooks/usePortfolioGrowth";
import type { HoldingDividendData } from "@/hooks/usePortfolioDividends";

interface HoldingLike { symbol: string; name?: string; value: number; weight: number; price: number; avgCost: number; shares: number }

interface KeyMetricsBenchmarksProps {
  holdings: HoldingLike[];
  research: Record<string, ResearchBundle | undefined>;
  valuations: Record<string, ValuationResult | undefined>;
  growth: Record<string, GrowthFigures>;
  dividendData: Record<string, HoldingDividendData>;
  benchmark: BenchmarkAverages;
  isLoading: boolean;
}

type Group = "Valuation" | "Future Growth" | "Past Performance" | "Financial Health" | "Dividends";
const GROUPS: Group[] = ["Valuation", "Future Growth", "Past Performance", "Financial Health", "Dividends"];

const SUBMETRICS: Record<Group, string[]> = {
  Valuation: ["Fair Value", "DCF", "PE", "PS", "PB"],
  "Future Growth": ["Earnings", "Revenue", "EPS"],
  "Past Performance": ["ROE", "ROCE", "ROA"],
  "Financial Health": ["Debt to Equity"],
  Dividends: ["Yield", "Growth", "Payout"],
};

const pctFmt = (v: number) => `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(1)}%`;
const xFmt = (v: number) => `${v.toFixed(1)}x`;

export function KeyMetricsBenchmarks({ holdings, research, valuations, growth, dividendData, benchmark, isLoading }: KeyMetricsBenchmarksProps) {
  const [group, setGroup] = useState<Group>("Valuation");
  const [metric, setMetric] = useState<string>("Fair Value");

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);

  const selectGroup = (g: Group) => { setGroup(g); setMetric(SUBMETRICS[g][0]); };

  // Builds dot-plot input for a per-holding numeric field with an optional
  // "higher is better" flag used purely for red/green coloring.
  function buildPoints(
    getValue: (symbol: string) => number | null | undefined,
    higherIsBetter: boolean,
    thresholdIsPortfolio = true,
  ) {
    const rows = holdings.map((h) => ({ symbol: h.symbol, weight: h.weight, value: getValue(h.symbol.toUpperCase()) }));
    const withValue = rows.filter((r): r is { symbol: string; weight: number; value: number } => r.value != null);
    const unavailableCount = rows.length - withValue.length;
    const coveredWeight = withValue.reduce((s, r) => s + r.weight, 0);
    const portfolioValue = coveredWeight > 0 ? withValue.reduce((s, r) => s + r.value * r.weight, 0) / coveredWeight : null;
    const points = withValue.map((r) => ({
      symbol: r.symbol,
      value: r.value,
      weight: r.weight,
      good: thresholdIsPortfolio && portfolioValue != null
        ? (higherIsBetter ? r.value >= portfolioValue : r.value <= portfolioValue)
        : undefined,
    }));
    return { points, portfolioValue, unavailableCount };
  }

  function render() {
    if (group === "Valuation") {
      if (metric === "Fair Value") {
        const { points, portfolioValue, unavailableCount } = buildPoints(
          (s) => valuations[s]?.models.find((m) => m.upsidePercent != null)?.upsidePercent ?? null,
          true,
        );
        return { title: "Narrative Fair Value", desc: "How far above or below its narrative fair value each holding trades.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} fmt={pctFmt} unavailableCount={unavailableCount} /> };
      }
      if (metric === "PE") {
        const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios.pe ?? null, false);
        return { title: "Price / Earnings", desc: "How many times earnings each holding trades at.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} marketValue={benchmark.pe} marketLabel={benchmark.sampleLabel} fmt={xFmt} unavailableCount={unavailableCount} /> };
      }
      if (metric === "PB") {
        const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios.pb ?? null, false);
        return { title: "Price / Book", desc: "How many times book value each holding trades at.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} fmt={xFmt} unavailableCount={unavailableCount} /> };
      }
      // DCF / PS — not currently computed by Continua's valuation service.
      return { title: metric, desc: metric === "DCF" ? "A discounted cash flow model isn't part of Continua's valuation engine yet — Sector P/E, Graham Number and Dividend Discount are." : "Price-to-sales isn't currently computed for NSE holdings.", node: <MetricDotPlot points={[]} fmt={xFmt} /> };
    }

    if (group === "Future Growth") {
      const field = metric === "Earnings" ? "earningsGrowthPct" : metric === "Revenue" ? "revenueGrowthPct" : "epsGrowthPct";
      const { points, portfolioValue, unavailableCount } = buildPoints((s) => growth[s]?.[field] ?? null, true);
      return { title: `Trailing ${metric} Growth`, desc: `How fast each holding's ${metric.toLowerCase()} actually grew last year, year over year — Continua doesn't have analyst forecasts, so this is trailing, not forecast.`, node: <MetricDotPlot points={points} portfolioValue={portfolioValue} fmt={pctFmt} unavailableCount={unavailableCount} /> };
    }

    if (group === "Past Performance") {
      if (metric === "ROCE") {
        return { title: "Return on Capital Employed (ROCE)", desc: "Not currently computed for NSE holdings.", node: <MetricDotPlot points={[]} fmt={pctFmt} /> };
      }
      const field = metric === "ROE" ? "roe" : "roa";
      const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios[field] ?? null, true);
      const marketValue = metric === "ROE" ? benchmark.roe : null;
      return { title: `Return on ${metric === "ROE" ? "Equity (ROE)" : "Assets (ROA)"}`, desc: `How much profit each holding earns on its ${metric === "ROE" ? "shareholders' equity" : "assets"}, against the market.`, node: <MetricDotPlot points={points} portfolioValue={portfolioValue} marketValue={marketValue} marketLabel={benchmark.sampleLabel} fmt={pctFmt} unavailableCount={unavailableCount} /> };
    }

    if (group === "Financial Health") {
      const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios.debtToEquity ?? null, false);
      return { title: "Debt to Equity", desc: "How much debt each holding carries for every unit of equity, against the market.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} marketValue={benchmark.debtToEquity} marketLabel={benchmark.sampleLabel} fmt={pctFmt} unavailableCount={unavailableCount} /> };
    }

    // Dividends
    if (metric === "Yield") {
      const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios.dividendYield ?? null, true);
      return { title: "Dividend Yield", desc: "How much income each holding pays, against the market.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} marketValue={benchmark.dividendYield} marketLabel={benchmark.sampleLabel} fmt={pctFmt} unavailableCount={unavailableCount} /> };
    }
    if (metric === "Payout") {
      const { points, portfolioValue, unavailableCount } = buildPoints((s) => research[s]?.ratios.payoutRatio ?? null, false);
      return { title: "Payout Ratio", desc: "How much of earnings each holding pays out as dividends — lower leaves more room to grow the payout.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} fmt={pctFmt} unavailableCount={unavailableCount} /> };
    }
    const { points, portfolioValue, unavailableCount } = buildPoints((s) => dividendData[s]?.growthPct ?? null, true);
    return { title: "Trailing Dividend Growth", desc: "How each holding's trailing 12-month payout compares with the 12 months before that.", node: <MetricDotPlot points={points} portfolioValue={portfolioValue} fmt={pctFmt} unavailableCount={unavailableCount} /> };
  }

  const { title, desc, node } = render();

  return (
    <div className="card-gradient rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <h3 className="font-serif text-lg">Key Metrics &amp; Benchmarks</h3>
        <InfoTip>
          Your value-weighted portfolio average compared against the {benchmark.sampleLabel} — a
          market-cap sample, not the full exchange, so we're not calling 60+ endpoints on every
          page load.
        </InfoTip>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 mb-2">
        {GROUPS.map((g) => (
          <button
            key={g}
            data-small-target
            onClick={() => selectGroup(g)}
            className={`shrink-0 h-8 px-3 rounded-full text-[11px] font-semibold ${group === g ? "bg-foreground text-background" : "bg-muted/60"}`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 mb-4">
        {SUBMETRICS[group].map((m) => (
          <button
            key={m}
            data-small-target
            onClick={() => setMetric(m)}
            className={`shrink-0 h-7 px-3 rounded-full text-[10.5px] font-semibold border ${metric === m ? "border-foreground text-foreground" : "border-transparent text-muted-foreground bg-muted/40"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="text-[13px] font-bold mb-0.5">{title}</p>
      <p className="text-[11px] text-muted-foreground mb-3">{desc}</p>

      {isLoading ? <p className="text-[11px] text-muted-foreground py-8 text-center">Loading benchmark data…</p> : node}
    </div>
  );
}