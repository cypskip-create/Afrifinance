import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props {
  symbol: string;
  price: number;
  fundamentals: Fundamentals;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 11,
};

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
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold">Total Return vs Benchmark</h4>
            <ToggleGroup type="single" size="sm" value={benchmark} onValueChange={(v) => v && setBenchmark(v as any)}>
              <ToggleGroupItem value="sector" className="h-6 text-[10px] px-2">Sector</ToggleGroupItem>
              <ToggleGroupItem value="nse" className="h-6 text-[10px] px-2">NSE 20</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returns} margin={{ top: 5, right: 6, bottom: 0, left: -18 }}>
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Company" radius={[4, 4, 0, 0]} name={symbol}>
                  {returns.map((d, i) => (
                    <Cell key={i} fill={d.Company >= 0 ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                  ))}
                </Bar>
                <Bar dataKey="Benchmark" radius={[4, 4, 0, 0]} fill="hsl(var(--muted-foreground))" fillOpacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold">Earnings Surprises</h4>
              <p className="text-[10px] text-muted-foreground">Beat estimate {beatRate}% of last 8 quarters</p>
            </div>
            <ToggleGroup type="single" size="sm" value={surpriseView} onValueChange={(v) => v && setSurpriseView(v as any)}>
              <ToggleGroupItem value="abs" className="h-6 text-[10px] px-2">EPS</ToggleGroupItem>
              <ToggleGroupItem value="pct" className="h-6 text-[10px] px-2">Surprise %</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              {surpriseView === "abs" ? (
                <BarChart data={surprises} margin={{ top: 5, right: 6, bottom: 0, left: -20 }}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `KES ${v}`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Estimate" fill="hsl(var(--muted-foreground))" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
                    {surprises.map((s, i) => (
                      <Cell key={i} fill={s.Actual >= s.Estimate ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={surprises} margin={{ top: 5, right: 6, bottom: 0, left: -20 }}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="surprise" radius={[4, 4, 0, 0]}>
                    {surprises.map((s, i) => (
                      <Cell key={i} fill={s.surprise >= 0 ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* MARGIN TRENDS */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Profitability Margins</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundamentals.marginsHistory} margin={{ top: 5, right: 6, bottom: 0, left: -20 }}>
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="gross" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Gross" />
                <Bar dataKey="operating" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Operating" />
                <Bar dataKey="net" fill="hsl(var(--bull))" radius={[4, 4, 0, 0]} name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* INSIDER TRANSACTIONS */}
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold">Insider Transactions</h4>
            <Badge variant="outline" className="text-[10px] text-bull border-bull/40 gap-1">
              <TrendingUp className="h-2.5 w-2.5" /> Net buying
            </Badge>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/40">
                  <th className="py-1.5 px-1 font-medium">Date</th>
                  <th className="py-1.5 px-1 font-medium">Insider</th>
                  <th className="py-1.5 px-1 font-medium">Type</th>
                  <th className="py-1.5 px-1 font-medium text-right">Shares</th>
                  <th className="py-1.5 px-1 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {fundamentals.insiderTrades.map(t => (
                  <tr key={t.date + t.insider} className="border-b border-border/20 last:border-0">
                    <td className="py-1.5 px-1 text-muted-foreground whitespace-nowrap">{t.date.slice(5)}</td>
                    <td className="py-1.5 px-1">
                      <div className="font-medium leading-tight">{t.insider}</div>
                      <div className="text-[9px] text-muted-foreground">{t.role}</div>
                    </td>
                    <td className="py-1.5 px-1">
                      <Badge variant="outline" className={`text-[9px] px-1.5 ${t.type === "Buy" ? "text-bull border-bull/40" : "text-bear border-bear/40"}`}>
                        {t.type === "Buy" ? <TrendingUp className="h-2 w-2 mr-0.5" /> : <TrendingDown className="h-2 w-2 mr-0.5" />}
                        {t.type}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-1 text-right font-medium">{(t.shares / 1000).toFixed(0)}K</td>
                    <td className="py-1.5 px-1 text-right font-bold">{(t.value / 1e6).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
