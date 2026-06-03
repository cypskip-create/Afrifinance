import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props {
  fundamentals: Fundamentals;
}

const fmtB = (n: number) => `${(n / 1e9).toFixed(1)}B`;

export function GrowthTab({ fundamentals }: Props) {
  const data = fundamentals.revenueHistory.map(r => ({
    year: r.year,
    Revenue: +(r.revenue / 1e9).toFixed(2),
    Earnings: +(r.earnings / 1e9).toFixed(2),
    forecast: r.forecast,
  }));

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-1">Revenue & Earnings (KES Billions)</h4>
          <p className="text-[10px] text-muted-foreground mb-2">Solid bars = historical · Lighter = forecast</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}B`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={(v: any) => `KES ${v}B`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Revenue" radius={[6, 6, 0, 0]}>
                  {data.map((d, i) => <Cell key={i} fill="hsl(var(--primary))" fillOpacity={d.forecast ? 0.4 : 1} />)}
                </Bar>
                <Bar dataKey="Earnings" radius={[6, 6, 0, 0]}>
                  {data.map((d, i) => <Cell key={i} fill="hsl(var(--bull))" fillOpacity={d.forecast ? 0.4 : 1} />)}
                </Bar>
              </BarChart>
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
