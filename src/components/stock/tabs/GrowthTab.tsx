import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Cell, Legend,
} from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props {
  fundamentals: Fundamentals;
}

type Metric = "revenue" | "earnings" | "eps";
type Range = "5Y" | "10Y" | "ALL";

export function GrowthTab({ fundamentals }: Props) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [range, setRange] = useState<Range>("10Y");

  const data = useMemo(() => {
    const all = fundamentals.revenueHistory.map(r => ({
      year: r.year,
      Revenue: +(r.revenue / 1e9).toFixed(2),
      Earnings: +(r.earnings / 1e9).toFixed(2),
      EPS: r.eps,
      forecast: r.forecast,
    }));
    if (range === "5Y") return all.slice(-7); // 5 history + 2 forecast
    if (range === "10Y") return all;
    return all;
  }, [fundamentals, range]);

  const metricKey = metric === "revenue" ? "Revenue" : metric === "earnings" ? "Earnings" : "EPS";
  const yFmt = (v: number) => metric === "eps" ? v.toFixed(1) : `${v}B`;
  const tipFmt = (v: any) => metric === "eps" ? `KES ${v}` : `KES ${v}B`;

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h4 className="text-xs font-bold">Growth History & Forecast</h4>
            <ToggleGroup type="single" size="sm" value={range} onValueChange={(v) => v && setRange(v as Range)}>
              <ToggleGroupItem value="5Y" className="h-6 text-[10px] px-2">5Y</ToggleGroupItem>
              <ToggleGroupItem value="10Y" className="h-6 text-[10px] px-2">10Y</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <ToggleGroup
            type="single"
            size="sm"
            value={metric}
            onValueChange={(v) => v && setMetric(v as Metric)}
            className="justify-start mb-2"
          >
            <ToggleGroupItem value="revenue" className="h-6 text-[10px] px-2.5">Revenue</ToggleGroupItem>
            <ToggleGroupItem value="earnings" className="h-6 text-[10px] px-2.5">Earnings</ToggleGroupItem>
            <ToggleGroupItem value="eps" className="h-6 text-[10px] px-2.5">EPS</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-[10px] text-muted-foreground mb-1.5">Solid = historical · Lighter = forecast</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={yFmt} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={tipFmt} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey={metricKey} radius={[6, 6, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={metric === "revenue" ? "hsl(var(--primary))" : metric === "earnings" ? "hsl(var(--bull))" : "hsl(var(--accent))"} fillOpacity={d.forecast ? 0.4 : 1} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey={metricKey} stroke="hsl(var(--foreground))" strokeWidth={1.5} strokeOpacity={0.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-xs font-bold">Growth vs Sector Average</h4>
          {fundamentals.growthMetrics.map(g => {
            const beat = g.value >= g.sector;
            return (
              <div key={g.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{g.label}</span>
                  <span className={`font-bold ${beat ? "text-bull" : "text-bear"}`}>+{g.value.toFixed(1)}%</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full">
                  <div className="absolute top-0 h-full bg-primary rounded-full" style={{ width: `${Math.min(100, g.value * 4)}%` }} />
                  <div className="absolute top-[-2px] h-3 w-0.5 bg-foreground/60" style={{ left: `${Math.min(100, g.sector * 4)}%` }} title="Sector average" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sector avg: {g.sector.toFixed(1)}%</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
