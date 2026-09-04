import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";
import { historicalApi } from "@/api/historicalApi";
import { useStockFinancials } from "@/hooks/useStockFinancials";
import { useResearch } from "@/hooks/useResearch";
import { InfoTip } from "@/components/portfolio/InfoTip";

interface Props { symbol: string; price: number }

const PERIODS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 91 },
  { label: "6M", days: 182 },
  { label: "1Y", days: 365 },
];

function returnOverDays(candles: { timestamp: string; close: number }[], days: number): number | null {
  if (candles.length < 2) return null;
  const targetTime = Date.now() - days * 86_400_000;
  const earliest = new Date(candles[0].timestamp).getTime();
  if (targetTime < earliest) return null; // not enough history on file for this window
  let closest = candles[0];
  for (const c of candles) {
    if (Math.abs(new Date(c.timestamp).getTime() - targetTime) < Math.abs(new Date(closest.timestamp).getTime() - targetTime)) closest = c;
  }
  const last = candles[candles.length - 1];
  if (closest.close === 0) return null;
  return ((last.close - closest.close) / closest.close) * 100;
}

/** Trailing total return computed from real daily candles — replacing
 *  the synthetic pastReturns/analystTargets/earningsSurprises this tab
 *  used to run on. There's no sector or NSE-index benchmark series to
 *  compare against, and no analyst estimates to compute a "surprise"
 *  from, so both are replaced with real, honestly-scoped alternatives:
 *  real EPS history instead of EPS-vs-estimate, and no benchmark line
 *  rather than a fabricated one. */
export function PerformanceTab({ symbol, price }: Props) {
  const candlesQuery = useQuery({
    queryKey: ["continua", "candles", symbol, "1y-perf"],
    queryFn: () => historicalApi.getCandles(symbol, { interval: "1d", from: new Date(Date.now() - 370 * 86_400_000).toISOString().slice(0, 10) }),
    staleTime: 15 * 60_000,
  });
  const { history, isLoading: historyLoading } = useStockFinancials(symbol);
  const { research, isLoading: researchLoading } = useResearch(symbol);

  const candles = candlesQuery.data ?? [];
  const returns = PERIODS.map((p) => ({ label: p.label, value: returnOverDays(candles, p.days) }));

  const epsHistory = useMemo(
    () => [...history].sort((a, b) => a.fiscalYear - b.fiscalYear).map((r) => ({ year: String(r.fiscalYear), EPS: r.eps })),
    [history]
  );

  const ratios = research?.ratios;

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-bold">Trailing Total Return</p>
            <InfoTip>Computed from real daily closing prices on file — Continua has no sector or NSE-index historical series to benchmark against yet, so this shows the company only.</InfoTip>
          </div>
          {candlesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading price history…
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 pt-2">
              {returns.map((r) => (
                <div key={r.label} className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">{r.label}</p>
                  {r.value == null ? (
                    <p className="text-xs text-muted-foreground mt-1">No data</p>
                  ) : (
                    <p className={`text-sm font-bold tabular ${r.value >= 0 ? "text-bull" : "text-bear"}`}>
                      {r.value >= 0 ? <ArrowUpRight className="h-2.5 w-2.5 inline" /> : <ArrowDownRight className="h-2.5 w-2.5 inline" />}
                      {r.value >= 0 ? "+" : ""}{r.value.toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs font-bold">Analyst Price Targets</p>
            <InfoTip>Continua doesn't ingest a street analyst price-target feed yet.</InfoTip>
          </div>
          <p className="text-xs text-muted-foreground pt-2">No analyst coverage on file for {symbol} yet.</p>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          {historyLoading ? (
            <p className="text-xs text-muted-foreground py-4">Loading financial history…</p>
          ) : epsHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No reported EPS history on file for {symbol} yet.</p>
          ) : (
            <BarChartBlock
              title="Reported EPS History"
              annual={epsHistory}
              xKey="year"
              series={[{ key: "EPS", label: "Reported EPS", color: fx.eps }]}
              colorFor={(row) => (row.EPS >= 0 ? fx.positive : fx.negative)}
              valueFmt={(v) => `KES ${v}`}
            />
          )}
          <p className="text-[10px] text-muted-foreground mt-1">Real, already-reported EPS — no analyst estimate to compare against, so no "surprise" is shown.</p>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <p className="text-xs font-bold mb-2">Current Profitability</p>
          {researchLoading ? (
            <p className="text-xs text-muted-foreground py-2">Loading…</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div><p className="text-[9.5px] text-muted-foreground">Gross margin</p><p className="text-sm font-bold tabular">{ratios?.grossMargin != null ? `${(ratios.grossMargin * 100).toFixed(1)}%` : "—"}</p></div>
              <div><p className="text-[9.5px] text-muted-foreground">Operating margin</p><p className="text-sm font-bold tabular">{ratios?.operatingMargin != null ? `${(ratios.operatingMargin * 100).toFixed(1)}%` : "—"}</p></div>
              <div><p className="text-[9.5px] text-muted-foreground">Net margin</p><p className="text-sm font-bold tabular">{ratios?.netMargin != null ? `${(ratios.netMargin * 100).toFixed(1)}%` : "—"}</p></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}