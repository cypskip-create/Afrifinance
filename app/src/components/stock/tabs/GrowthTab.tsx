import { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";
import { useStockFinancials } from "@/hooks/useStockFinancials";
import { useResearch } from "@/hooks/useResearch";
import { InfoTip } from "@/components/portfolio/InfoTip";
import { Loader2 } from "lucide-react";

interface Props { symbol: string }
type Metric = "revenue" | "earnings" | "eps";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

function pctChange(latest: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((latest - prior) / Math.abs(prior)) * 100;
}

/** Real multi-year revenue/earnings/EPS from financialsApi.getHistory,
 *  replacing the synthetic revenueHistory/marginsHistory/forecast data
 *  this tab used to run on entirely. Continua has no analyst forward
 *  estimates or a multi-year margin time series (the history endpoint
 *  only carries revenue/netIncome/eps), so the forecast-range and
 *  EPS-estimate sections are now honest placeholders instead of charts
 *  built on invented numbers, and margins show the current period only. */
export function GrowthTab({ symbol }: Props) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const { history, isLoading } = useStockFinancials(symbol);
  const { research, isLoading: researchLoading } = useResearch(symbol);

  const chronological = useMemo(() => [...history].sort((a, b) => a.fiscalYear - b.fiscalYear), [history]);
  const data = chronological.map((r) => ({
    year: String(r.fiscalYear),
    Revenue: +(r.revenue / 1e9).toFixed(2),
    Earnings: +(r.netIncome / 1e9).toFixed(2),
    EPS: r.eps,
  }));

  const key = metric === "revenue" ? "Revenue" : metric === "earnings" ? "Earnings" : "EPS";
  const color = metric === "revenue" ? fx.revenue : metric === "earnings" ? fx.earnings : fx.eps;
  const yFmt = (v: number) => (metric === "eps" ? v.toFixed(1) : `${v}B`);
  const tipFmt = (v: number) => (metric === "eps" ? `KES ${v}` : `KES ${v}B`);

  const [latest, prior] = [...history].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const growthRows = latest && prior ? [
    { label: "Revenue", value: pctChange(latest.revenue, prior.revenue) },
    { label: "Earnings", value: pctChange(latest.netIncome, prior.netIncome) },
    { label: "EPS", value: pctChange(latest.eps, prior.eps) },
  ] : [];

  const ratios = research?.ratios;
  const margins = [
    { label: "Gross margin", value: ratios?.grossMargin },
    { label: "Operating margin", value: ratios?.operatingMargin },
    { label: "Net margin", value: ratios?.netMargin },
  ];

  return (
    <div className="space-y-8">
      <div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading financial history…
          </div>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6">No financial history on file for {symbol} yet.</p>
        ) : (
          <BarChartBlock
            title="Growth History"
            annual={data}
            xKey="year"
            series={[{ key, label: metric === "eps" ? "EPS" : key, color }]}
            yFmt={yFmt}
            valueFmt={(v) => tipFmt(v)}
            right={
              <ToggleGroup type="single" size="sm" value={metric} onValueChange={(v) => v && setMetric(v as Metric)}>
                <ToggleGroupItem value="revenue" className="h-6 text-[10px] px-2">Revenue</ToggleGroupItem>
                <ToggleGroupItem value="earnings" className="h-6 text-[10px] px-2">Earnings</ToggleGroupItem>
                <ToggleGroupItem value="eps" className="h-6 text-[10px] px-2">EPS</ToggleGroupItem>
              </ToggleGroup>
            }
          />
        )}
        <p className="text-[10px] text-muted-foreground mt-1">Up to the last 5 reported annual periods on file — not a forecast.</p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Trailing Growth (Last Reported Year vs Prior)</Eyebrow>
          <InfoTip>Real, already-reported year-over-year growth — Continua doesn't ingest analyst forward growth estimates, so this is trailing, not forecast.</InfoTip>
        </div>
        {growthRows.length === 0 ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">Need two full annual periods on file to compute growth.</p>
        ) : (
          <div className="border-t border-border/60 divide-y divide-border/40">
            {growthRows.map((g) => (
              <div key={g.label} className="flex items-center justify-between py-2.5">
                <span className="text-xs font-medium">{g.label}</span>
                {g.value == null ? (
                  <span className="text-[10px] text-muted-foreground">No data</span>
                ) : (
                  <span className={`text-sm font-bold tabular ${g.value >= 0 ? "text-bull" : "text-bear"}`}>{g.value >= 0 ? "+" : ""}{g.value.toFixed(1)}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Eyebrow>Current Margins</Eyebrow>
        {researchLoading ? (
          <p className="text-xs text-muted-foreground py-3">Loading…</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-3">
            {margins.map((m) => (
              <div key={m.label}>
                <p className="text-[9.5px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-bold tabular">{m.value != null ? `${(m.value * 100).toFixed(1)}%` : "—"}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-2">Current period only — Continua doesn't yet have a multi-year margin time series.</p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Forward Estimates</Eyebrow>
          <InfoTip>Continua doesn't ingest a street analyst estimates feed, so revenue forecast ranges and EPS estimate drift aren't shown here rather than invented.</InfoTip>
        </div>
        <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
          No analyst forward estimates on file for {symbol} — the Growth History above is real, already-reported data instead.
        </p>
      </div>
    </div>
  );
}