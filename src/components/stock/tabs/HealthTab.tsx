import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Legend,
} from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props { fundamentals: Fundamentals }
type Range = "5Y" | "10Y";

export function HealthTab({ fundamentals }: Props) {
  const [range, setRange] = useState<Range>("10Y");

  const cd = useMemo(() => {
    const all = fundamentals.cashVsDebt.map(r => ({
      year: r.year,
      Cash: +(r.cash / 1e9).toFixed(2),
      Debt: +(r.debt / 1e9).toFixed(2),
    }));
    return range === "5Y" ? all.slice(-5) : all;
  }, [fundamentals, range]);

  const cf = useMemo(() => {
    const all = fundamentals.operatingCashFlow.map(r => ({
      year: r.year,
      CashFlow: +(r.cf / 1e9).toFixed(2),
    }));
    return range === "5Y" ? all.slice(-5) : all;
  }, [fundamentals, range]);

  const latest = cd[cd.length - 1];
  const netCash = latest ? latest.Cash - latest.Debt : 0;

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold">Cash vs Debt</h4>
              <p className={`text-[10px] font-semibold ${netCash >= 0 ? "text-bull" : "text-bear"}`}>
                Net {netCash >= 0 ? "cash" : "debt"}: KES {Math.abs(netCash).toFixed(1)}B
              </p>
            </div>
            <ToggleGroup type="single" size="sm" value={range} onValueChange={(v) => v && setRange(v as Range)}>
              <ToggleGroupItem value="5Y" className="h-6 text-[10px] px-2">5Y</ToggleGroupItem>
              <ToggleGroupItem value="10Y" className="h-6 text-[10px] px-2">10Y</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}B`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={(v: any) => `KES ${v}B`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Cash" stackId="a" fill="hsl(var(--bull))" />
                <Bar dataKey="Debt" stackId="a" fill="hsl(var(--bear))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Operating Cash Flow Trend</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cf} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="cfGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}B`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} formatter={(v: any) => `KES ${v}B`} />
                <Area type="monotone" dataKey="CashFlow" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#cfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4 space-y-2.5">
          <h4 className="text-xs font-bold mb-1">Health Checklist</h4>
          {fundamentals.healthChecks.map(c => (
            <div key={c.label} className="flex items-center gap-2">
              {c.ok ? <CheckCircle2 className="h-4 w-4 text-bull shrink-0" /> : <XCircle className="h-4 w-4 text-bear shrink-0" />}
              <span className="text-xs">{c.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
