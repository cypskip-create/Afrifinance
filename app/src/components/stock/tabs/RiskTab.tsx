import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { fx } from "@/lib/chartPalette";
import { historicalApi } from "@/api/historicalApi";
import { useResearch } from "@/hooks/useResearch";
import { useValuation } from "@/hooks/useValuation";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";
import { InfoTip } from "@/components/portfolio/InfoTip";
import { dailyReturns, annualizedVolatility, maxDrawdown } from "@/lib/portfolioMetrics";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

interface RiskFactor { label: string; note: string; level: "Low" | "Medium" | "High" }
const levelScore = (l: string) => (l === "Low" ? 80 : l === "Medium" ? 50 : 20);
const levelColor = (l: string) => (l === "Low" ? fx.strong : l === "Medium" ? fx.ok : fx.weak);

/** Real annualized volatility and max drawdown from daily candles (same
 *  math as the portfolio's Risk Analysis tool), plus a risk checklist
 *  built from real valuation, momentum, and leverage signals instead of
 *  the fully synthetic risk factors this tab used to show. */
export function RiskTab({ symbol }: { symbol: string }) {
  const candlesQuery = useQuery({
    queryKey: ["continua", "candles", symbol, "risk-180"],
    queryFn: () => historicalApi.getCandles(symbol, { interval: "1d", from: new Date(Date.now() - 180 * 86_400_000).toISOString().slice(0, 10) }),
    staleTime: 15 * 60_000,
  });
  const { research } = useResearch(symbol);
  const { valuation } = useValuation(symbol);
  const { averages: benchmark } = useMarketBenchmark();

  const closes = (candlesQuery.data ?? []).map((c) => c.close);
  const returns = dailyReturns(closes);
  const volatility = returns.length >= 5 ? annualizedVolatility(returns) : null;
  const drawdown = closes.length >= 2 ? maxDrawdown(closes) : null;

  const ratios = research?.ratios;
  const bestModel = valuation?.models.find((m) => m.upsidePercent != null);

  const factors: RiskFactor[] = [
    { label: "Valuation risk", note: bestModel?.upsidePercent != null ? `${Math.abs(bestModel.upsidePercent).toFixed(0)}% ${bestModel.upsidePercent >= 0 ? "below" : "above"} the model's fair value` : "No valuation model available", level: bestModel?.upsidePercent == null ? "Medium" : bestModel.upsidePercent < -20 ? "High" : bestModel.upsidePercent < 0 ? "Medium" : "Low" },
    { label: "Price volatility", note: volatility != null ? `${volatility.toFixed(1)}% annualized, last 180 days` : "Not enough price history on file", level: volatility == null ? "Medium" : volatility > 35 ? "High" : volatility > 20 ? "Medium" : "Low" },
    { label: "Leverage risk", note: ratios?.debtToEquity != null ? `Debt/equity ${ratios.debtToEquity.toFixed(0)}% vs market sample ${benchmark.debtToEquity?.toFixed(0) ?? "—"}%` : "No debt/equity data on file", level: ratios?.debtToEquity == null || benchmark.debtToEquity == null ? "Medium" : ratios.debtToEquity > benchmark.debtToEquity * 1.5 ? "High" : ratios.debtToEquity > benchmark.debtToEquity ? "Medium" : "Low" },
    { label: "Momentum risk", note: ratios?.priceMomentum3m != null ? `${ratios.priceMomentum3m >= 0 ? "+" : ""}${ratios.priceMomentum3m.toFixed(1)}% over 3 months` : "No momentum data on file", level: ratios?.priceMomentum3m == null ? "Medium" : ratios.priceMomentum3m < -10 ? "High" : ratios.priceMomentum3m < 0 ? "Medium" : "Low" },
    { label: "Drawdown risk", note: drawdown != null ? `${drawdown.toFixed(1)}% peak-to-trough, last 180 days` : "Not enough price history on file", level: drawdown == null ? "Medium" : drawdown < -30 ? "High" : drawdown < -15 ? "Medium" : "Low" },
  ];

  const radar = factors.map((r) => ({ factor: r.label.replace(" risk", ""), safety: levelScore(r.level) }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Risk Snowflake — higher is safer</Eyebrow>
          <InfoTip>Five real checks (valuation, volatility, leverage, momentum, drawdown) — this is Continua's own risk framework, not Simply Wall St's published methodology.</InfoTip>
        </div>
        <div className="h-64 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Radar dataKey="safety" stroke={fx.strong} fill={fx.strong} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Volatility</Eyebrow>
          <InfoTip>Annualized standard deviation of daily returns from real price history — there's no sector-level volatility series to compare against yet.</InfoTip>
        </div>
        {candlesQuery.isLoading ? (
          <p className="text-xs text-muted-foreground py-2">Loading price history…</p>
        ) : volatility == null ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">Not enough price history on file for {symbol} yet.</p>
        ) : (
          <p className="text-2xl font-bold tabular border-t border-border/60 pt-3">{volatility.toFixed(1)}%</p>
        )}
      </div>

      <div>
        <Eyebrow>Key Risk Factors</Eyebrow>
        <div className="border-t border-border/60">
          {factors.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-3 py-3 border-b border-border/40 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.note}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0" style={{ color: levelColor(r.level), borderColor: `${levelColor(r.level)}55` }}>{r.level}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}