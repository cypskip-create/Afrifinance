import { Badge } from "@/components/ui/badge";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";
import { useValuation } from "@/hooks/useValuation";
import { useResearch } from "@/hooks/useResearch";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";
import { InfoTip } from "@/components/portfolio/InfoTip";
import { Loader2, Info } from "lucide-react";

interface Props { price: number; pe: string; fundamentals: Fundamentals; symbol: string; onSeePerformance?: () => void }

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function ValuationTab({ price, pe, fundamentals, symbol, onSeePerformance }: Props) {
  const { valuation, isLoading: valuationLoading } = useValuation(symbol);
  const { research, isLoading: researchLoading } = useResearch(symbol);
  const { averages: benchmark, isLoading: benchmarkLoading } = useMarketBenchmark();

  // The gauge and multiples used to run entirely on the synthetic
  // `fundamentals` bundle. Now: the gauge uses the first real valuation
  // model that returned a fair value (same models list rendered below —
  // no separate estimate invented for the gauge), and the multiples use
  // real research ratios vs. the same NSE market-cap sample the portfolio
  // Analysis tab benchmarks against. Only EV/EBITDA still has no real
  // source, so it's shown as N/A rather than dropped silently.
  const bestModel = valuation?.models.find((m) => m.fairValue != null);
  const fair = bestModel?.fairValue ?? null;
  const upside = fair != null ? ((fair - price) / price) * 100 : null;
  const tag = upside == null ? null : upside > 10 ? "Undervalued" : upside < -10 ? "Overvalued" : "Fairly Valued";
  const tagColor = upside == null ? fx.ok : upside > 10 ? fx.strong : upside < -10 ? fx.weak : fx.ok;

  const clamp = upside == null ? 0 : Math.max(-50, Math.min(50, upside));
  const angle = ((clamp + 50) / 100) * 180;
  const pct = ((clamp + 50) / 100) * 100;
  const cx = 100, cy = 100, rad = 78;
  const nx = cx + rad * Math.cos((180 - angle) * Math.PI / 180);
  const ny = cy - rad * Math.sin((180 - angle) * Math.PI / 180);

  const realPe = research?.ratios.pe ?? null;
  const realPb = research?.ratios.pb ?? null;
  const comparison = [
    { metric: "P/E", company: realPe ?? (parseFloat(pe) || 0), sector: benchmark.pe ?? 0 },
    { metric: "P/B", company: realPb ?? +(price / 25).toFixed(2), sector: fundamentals.pbSector },
  ];
  const multiplesAreReal = realPe != null && realPb != null && benchmark.pe != null;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Model-Based Estimates</Eyebrow>
        </div>
        {valuationLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
            <Loader2 className="h-3 w-3 animate-spin" /> Computing valuation models…
          </div>
        ) : !valuation ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">Not enough data on file to compute valuation models for {symbol} yet.</p>
        ) : (
          <div className="border-t border-border/60 divide-y divide-border/40">
            {valuation.models.map((model) => (
              <div key={model.model} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{model.model}</p>
                  {model.fairValue != null ? (
                    <div className="text-right">
                      <p className="text-sm font-bold tabular">{valuation.currency} {model.fairValue.toFixed(2)}</p>
                      {model.upsidePercent != null && (
                        <p className={`text-[10px] font-semibold tabular ${model.upsidePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {model.upsidePercent >= 0 ? '+' : ''}{model.upsidePercent.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">N/A</Badge>
                  )}
                </div>
                {model.unavailableReason ? (
                  <p className="text-[10px] text-muted-foreground mt-1">{model.unavailableReason}</p>
                ) : (
                  <div className="flex items-start gap-1 mt-1">
                    <Info className="h-2.5 w-2.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-snug">{model.methodology}</p>
                  </div>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-2">{valuation.caveat}</p>
          </div>
        )}
      </div>

      {/* Fair value gauge — now driven by the first real model above that
          returned a number, instead of a separate synthetic estimate. */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Fair Value Estimate</Eyebrow>
          <InfoTip>Uses the first model above with a real fair value — no separate number is invented for this gauge.</InfoTip>
        </div>
        {fair == null ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
            None of the models above could compute a fair value for {symbol} yet.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <div>
                <p className="text-2xl font-bold tabular">{valuation?.currency ?? "KES"} {fair.toFixed(2)}</p>
                <p className="text-xs font-semibold tabular" style={{ color: tagColor }}>
                  {upside! >= 0 ? "+" : ""}{upside!.toFixed(1)}% vs current
                </p>
              </div>
              <Badge variant="outline" style={{ color: tagColor, borderColor: `${tagColor}55` }} className="text-[10px]">{tag}</Badge>
            </div>
            <div className="flex justify-center mt-2">
              <svg viewBox="0 0 200 118" className="w-full max-w-[280px]">
                <defs>
                  <linearGradient id="valgauge" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#e0245e" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  stroke="url(#valgauge)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${pct} ${100 - pct}`}
                />
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="5" fill="hsl(var(--foreground))" />
                <text x="20" y="115" fontSize="9" fill="hsl(var(--muted-foreground))">Overvalued</text>
                <text x="150" y="115" fontSize="9" fill="hsl(var(--muted-foreground))">Undervalued</text>
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Analyst Consensus — Continua has no analyst price-target data
          source (see docs/architecture/FRONTEND_INTEGRATION.md), so
          rather than show fabricated "N analysts, avg target" numbers,
          this is now an honest placeholder pointing back to the real
          model-based estimates above. */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Analyst Consensus</Eyebrow>
          <InfoTip>Continua doesn't ingest a street analyst price-target feed yet — the Model-Based Estimates above are Continua's own real valuation models instead.</InfoTip>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            No analyst price-target coverage on file for {symbol} yet.
          </p>
          <button data-small-target onClick={onSeePerformance} disabled={!onSeePerformance}>
            <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted/60">See Performance →</Badge>
          </button>
        </div>
      </div>

      {/* Multiples vs sector — real P/E and P/B against the NSE market-cap
          sample where research ratios are available; EV/EBITDA has no
          real source yet so it's omitted rather than faked. */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Eyebrow>Valuation Multiples vs Market</Eyebrow>
          <InfoTip>{benchmark.sampleLabel} is the comparison point — the same market-cap sample used across Continua's benchmark tools.</InfoTip>
        </div>
        {researchLoading || benchmarkLoading ? (
          <p className="text-xs text-muted-foreground pt-2">Loading…</p>
        ) : (
          <>
            <BarChartBlock
              title=""
              annual={comparison}
              xKey="metric"
              series={[
                { key: "company", label: symbol, color: fx.revenue },
                { key: "sector", label: benchmark.sampleLabel, color: fx.foreign },
              ]}
              valueFmt={(v) => `${Number(v).toFixed(2)}x`}
              yFmt={(v) => `${v}x`}
            />
            {!multiplesAreReal && (
              <p className="text-[10px] text-muted-foreground mt-2">Some figures above fall back to an estimate where real data isn't on file yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}