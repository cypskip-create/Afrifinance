import { useMemo } from "react";
import { Sankey, ResponsiveContainer, Layer, Rectangle, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { ReportSection, SubWidget } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { KeyInfoUpdates } from "./KeyInfoUpdates";
import { SemiGauge } from "./SemiGauge";
import { useStockFinancials } from "@/hooks/useStockFinancials";
import { useResearch } from "@/hooks/useResearch";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";
import { fx } from "@/lib/chartPalette";

interface Props { symbol: string; currency: string }

function fmtB(v: number | undefined | null) {
  if (v == null) return "—";
  return `${(v / 1e9).toFixed(2)}B`;
}
function pctChange(latest: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((latest - prior) / Math.abs(prior)) * 100;
}

export function PastPerformanceSection({ symbol, currency }: Props) {
  const { latest, history, isLoading } = useStockFinancials(symbol);
  const { research } = useResearch(symbol);
  const { averages: benchmark } = useMarketBenchmark();
  const ratios = research?.ratios;

  const chronological = useMemo(() => [...history].sort((a, b) => a.fiscalYear - b.fiscalYear), [history]);
  const areaData = chronological.map((r) => ({ year: String(r.fiscalYear), Revenue: +(r.revenue / 1e9).toFixed(2), Earnings: +(r.netIncome / 1e9).toFixed(2) }));

  const [mostRecent, prior] = [...history].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const earningsGrowth1y = mostRecent && prior ? pctChange(mostRecent.netIncome, prior.netIncome) : null;

  const sankeyData = latest ? {
    nodes: [{ name: "Revenue" }, { name: "Cost of Sales" }, { name: "Gross Profit" }, { name: "Earnings" }, { name: "Expenses" }],
    links: [
      { source: 0, target: 1, value: Math.max(1, latest.costOfRevenue ?? latest.revenue * 0.6) },
      { source: 0, target: 2, value: Math.max(1, latest.grossProfit ?? latest.revenue * 0.4) },
      { source: 2, target: 3, value: Math.max(1, latest.netIncome) },
      { source: 2, target: 4, value: Math.max(1, (latest.grossProfit ?? 0) - latest.netIncome) },
    ],
  } : null;

  const checks = [
    { label: "Earnings grew over the last year", status: earningsGrowth1y == null ? "unknown" as const : earningsGrowth1y > 0 ? "pass" as const : "fail" as const },
    { label: "Revenue grew over the last year", status: mostRecent && prior ? (pctChange(mostRecent.revenue, prior.revenue)! > 0 ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "ROE above NSE sample", status: ratios?.roe != null && benchmark.roe != null ? (ratios.roe > benchmark.roe ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Positive net margin", status: ratios?.netMargin != null ? (ratios.netMargin > 0 ? "pass" as const : "fail" as const) : "unknown" as const },
  ];

  return (
    <ReportSection number={3} title="Past Performance">
      <CriteriaChecklist
        checks={checks}
        narrative={isLoading ? "Loading…" : `${symbol}'s earnings ${earningsGrowth1y != null ? `changed ${earningsGrowth1y >= 0 ? "+" : ""}${earningsGrowth1y.toFixed(1)}% over the last year` : "history is not on file yet"}. Real, already-reported figures — not a projection.`}
      />

      <KeyInfoUpdates
        rows={[
          { label: "Return on equity", value: ratios?.roe != null ? `${ratios.roe.toFixed(1)}%` : "n/a", highlight: true },
          { label: "1-year earnings growth", value: earningsGrowth1y != null ? `${earningsGrowth1y >= 0 ? "+" : ""}${earningsGrowth1y.toFixed(1)}%` : "n/a", highlight: true },
          { label: "Net margin", value: ratios?.netMargin != null ? `${(ratios.netMargin * 100).toFixed(1)}%` : "n/a" },
          { label: "Last reported period", value: mostRecent ? `FY${mostRecent.fiscalYear}` : "n/a" },
        ]}
        updates={[]}
        updatesTitle="Recent past performance updates"
      />

      <SubWidget number="3.1" title="Revenue & Expenses Breakdown" description={`How ${symbol} makes and spends money, based on the latest reported period.`}>
        {!sankeyData ? <p className="text-xs text-muted-foreground py-6">No income statement on file yet.</p> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey data={sankeyData} nodeWidth={10} nodePadding={20} link={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.25 }}
                node={(props: any) => (
                  <Layer><Rectangle {...props} fill="hsl(217 91% 60%)" /><text x={props.x + props.width + 6} y={props.y + props.height / 2} fontSize={10} fill="hsl(var(--foreground))" dominantBaseline="middle">{props.payload.name}</text></Layer>
                )}
              />
            </ResponsiveContainer>
          </div>
        )}
      </SubWidget>

      <SubWidget number="3.2" title="Earnings and Revenue History" description="Real revenue and earnings from Continua's financial statements, up to the last 5 reported years.">
        {areaData.length === 0 ? <p className="text-xs text-muted-foreground py-6">No history on file yet.</p> : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${currency} ${v}B`, ""]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="Revenue" stroke={fx.revenue} fill={fx.revenue} fillOpacity={0.25} />
                <Area type="monotone" dataKey="Earnings" stroke={fx.earnings} fill={fx.earnings} fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </SubWidget>

      <SubWidget number="3.3" title="Free Cash Flow vs Earnings Analysis" description="Real current-period figures — Continua doesn't have a multi-year cash-flow time series yet.">
        {!latest ? <p className="text-xs text-muted-foreground py-6">No cash flow statement on file yet.</p> : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-muted-foreground">Earnings</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.netIncome)}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Operating CF</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.operatingCashFlow)}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Free Cash Flow</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.freeCashFlow)}</p></div>
          </div>
        )}
      </SubWidget>

      <SubWidget number="3.4" title="Past Earnings Growth Analysis" description="Company growth vs the NSE market-cap sample — Continua doesn't have a sector-average growth figure yet.">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div><p className="text-[10px] text-muted-foreground">Company (1Y)</p><p className={`text-lg font-bold tabular ${earningsGrowth1y != null && earningsGrowth1y >= 0 ? "text-bull" : "text-bear"}`}>{earningsGrowth1y != null ? `${earningsGrowth1y >= 0 ? "+" : ""}${earningsGrowth1y.toFixed(1)}%` : "n/a"}</p></div>
          <div><p className="text-[10px] text-muted-foreground">NSE Top 15 sample</p><p className="text-lg font-bold tabular text-muted-foreground">n/a</p></div>
        </div>
      </SubWidget>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SubWidget number="3.5" title="ROE"><SemiGauge label="ROE" value={ratios?.roe ?? null} industryValue={benchmark.roe} /></SubWidget>
        <SubWidget number="3.6" title="ROA"><SemiGauge label="ROA" value={ratios?.roa ?? null} industryValue={null} max={20} /></SubWidget>
        <SubWidget number="3.7" title="ROCE"><p className="text-xs text-muted-foreground py-6 text-center">Not currently computed for NSE holdings.</p></SubWidget>
      </div>
    </ReportSection>
  );
}