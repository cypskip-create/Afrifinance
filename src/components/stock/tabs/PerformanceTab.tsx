import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";

interface Props {
  symbol: string;
  price: number;
  fundamentals: Fundamentals;
}




export function PerformanceTab({ symbol, price, fundamentals }: Props) {
  const [benchmark, setBenchmark] = useState<"sector" | "nse">("sector");
  const [surpriseView, setSurpriseView] = useState<"abs" | "pct">("abs");

  const returns = fundamentals.pastReturns.map(r => ({
    period: r.period,
    Company: r.company,
    Benchmark: benchmark === "sector" ? r.sector : r.nse,
  }));

  const surprises = useMemo(() => fundamentals.earningsSurprises.map(s => ({
    quarter: s.quarter,
    Estimate: s.estimate,
    Actual: s.actual,
    surprise: +(((s.actual - s.estimate) / s.estimate) * 100).toFixed(1),
  })), [fundamentals.earningsSurprises]);

  const beatRate = Math.round(
    (surprises.filter(s => s.surprise > 0).length / surprises.length) * 100
  );

  const tgt = fundamentals.analystTargets;
  const totalRatings = tgt.buy + tgt.hold + tgt.sell || 1;
  // position of current price on Low → High axis
  const tgtPct = Math.max(0, Math.min(100, ((price - tgt.low) / (tgt.high - tgt.low)) * 100));
  const avgPct = Math.max(0, Math.min(100, ((tgt.avg - tgt.low) / (tgt.high - tgt.low)) * 100));

  return (
    <div className="space-y-3">
      {/* PAST RETURNS */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <BarChartBlock
            title="Total Return vs Benchmark"
            annual={returns}
            annualCount={6}
            xKey="period"
            series={[
              { key: "Company", label: symbol, color: fx.positive },
              { key: "Benchmark", label: benchmark === "sector" ? "Sector average" : "NSE 20", color: fx.foreign },
            ]}
            colorFor={(row, s) => (s.key === "Benchmark" ? fx.foreign : row.Company >= 0 ? fx.positive : fx.negative)}
            yFmt={(v) => `${v}%`}
            valueFmt={(v) => `${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`}
            right={
              <ToggleGroup type="single" size="sm" value={benchmark} onValueChange={(v) => v && setBenchmark(v as any)}>
                <ToggleGroupItem value="sector" className="h-6 text-[10px] px-2">Sector</ToggleGroupItem>
                <ToggleGroupItem value="nse" className="h-6 text-[10px] px-2">NSE 20</ToggleGroupItem>
              </ToggleGroup>
            }
          />

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/40">
            {(["1Y", "3Y", "5Y"] as const).map(p => {
              const row = fundamentals.pastReturns.find(r => r.period === p)!;
              const bm = benchmark === "sector" ? row.sector : row.nse;
              const diff = row.company - bm;
              return (
                <div key={p} className="text-center">
                  <p className="text-[9px] text-muted-foreground uppercase">{p}</p>
                  <p className={`text-sm font-bold ${row.company >= 0 ? "text-bull" : "text-bear"}`}>{row.company >= 0 ? "+" : ""}{row.company.toFixed(1)}%</p>
                  <p className={`text-[10px] ${diff >= 0 ? "text-bull" : "text-bear"}`}>
                    {diff >= 0 ? <ArrowUpRight className="h-2.5 w-2.5 inline" /> : <ArrowDownRight className="h-2.5 w-2.5 inline" />}
                    {Math.abs(diff).toFixed(1)}% vs {benchmark === "sector" ? "sector" : "NSE"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      {/* ANALYST PRICE TARGETS */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold">Analyst Price Targets</h4>
            <Badge variant="outline" className="text-[10px]">{tgt.count} analysts</Badge>
          </div>

          <div className="relative h-12 mb-3">
            {/* Track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-bear/40 via-accent/50 to-bull/60" />
            {/* Avg marker */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${avgPct}%` }}>
              <div className="-translate-x-1/2 w-3 h-3 rounded-full bg-foreground ring-2 ring-background" />
              <p className="absolute top-4 -translate-x-1/2 text-[9px] font-semibold whitespace-nowrap">Avg KES {tgt.avg}</p>
            </div>
            {/* Current price marker */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${tgtPct}%` }}>
              <div className="-translate-x-1/2 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
              <p className="absolute -top-5 -translate-x-1/2 text-[9px] font-semibold text-primary whitespace-nowrap">Now KES {price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Low KES {tgt.low}</span>
            <span>High KES {tgt.high}</span>
          </div>

          {/* Rating distribution */}
          <div className="mt-4 space-y-1.5">
            {[
              { label: "Buy", value: tgt.buy, color: "bg-bull" },
              { label: "Hold", value: tgt.hold, color: "bg-chart-3" },
              { label: "Sell", value: tgt.sell, color: "bg-bear" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 text-[11px]">
                <span className="w-9 font-medium">{row.label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${(row.value / totalRatings) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-bold">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EARNINGS SURPRISES */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <p className="text-[10px] text-muted-foreground mb-1">Beat estimate {beatRate}% of last 8 quarters</p>
          {surpriseView === "abs" ? (
            <BarChartBlock
              title="Earnings Surprises"
              annual={surprises}
              annualCount={5}
              xKey="quarter"
              series={[
                { key: "Estimate", label: "Analyst estimate", color: fx.forecast },
                { key: "Actual", label: "Actual EPS", color: fx.positive },
              ]}
              colorFor={(row, s) => (s.key === "Estimate" ? fx.forecast : row.Actual >= row.Estimate ? fx.positive : fx.negative)}
              valueFmt={(v) => `KES ${v}`}
              right={
                <ToggleGroup type="single" size="sm" value={surpriseView} onValueChange={(v) => v && setSurpriseView(v as any)}>
                  <ToggleGroupItem value="abs" className="h-6 text-[10px] px-2">EPS</ToggleGroupItem>
                  <ToggleGroupItem value="pct" className="h-6 text-[10px] px-2">Surprise %</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          ) : (
            <BarChartBlock
              title="Earnings Surprises"
              annual={surprises}
              annualCount={5}
              xKey="quarter"
              series={[{ key: "surprise", label: "Surprise vs estimate", color: fx.positive }]}
              colorFor={(row) => (row.surprise >= 0 ? fx.positive : fx.negative)}
              yFmt={(v) => `${v}%`}
              valueFmt={(v) => `${v}%`}
              right={
                <ToggleGroup type="single" size="sm" value={surpriseView} onValueChange={(v) => v && setSurpriseView(v as any)}>
                  <ToggleGroupItem value="abs" className="h-6 text-[10px] px-2">EPS</ToggleGroupItem>
                  <ToggleGroupItem value="pct" className="h-6 text-[10px] px-2">Surprise %</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          )}
        </CardContent>
      </Card>


      {/* MARGIN TRENDS */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <BarChartBlock
            title="Profitability Margins"
            annual={fundamentals.marginsHistory}
            allowQuarterly
            xKey="year"
            series={[
              { key: "gross", label: "Gross margin", color: fx.grossMargin },
              { key: "operating", label: "Operating margin", color: fx.operatingMargin },
              { key: "net", label: "Net margin", color: fx.netMargin },
            ]}
            yFmt={(v) => `${v}%`}
            valueFmt={(v) => `${Number(v).toFixed(1)}%`}
          />
        </CardContent>
      </Card>



    </div>
  );
}