import { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, Line,
  LineChart, CartesianGrid, AreaChart, Area,
} from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx, axisStyle, gridStyle } from "@/lib/chartPalette";
import { ColorTooltip, ChartKey } from "@/components/charts/ChartTooltip";
import { BarChartBlock } from "@/components/charts/BarChartBlock";



interface Props { fundamentals: Fundamentals }
type Metric = "revenue" | "earnings" | "eps";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function GrowthTab({ fundamentals }: Props) {
  const [metric, setMetric] = useState<Metric>("revenue");

  const data = useMemo(() => fundamentals.revenueHistory.map(r => ({
    year: r.year,
    Revenue: +(r.revenue / 1e9).toFixed(2),
    Earnings: +(r.earnings / 1e9).toFixed(2),
    EPS: r.eps,
    forecast: r.forecast,
  })), [fundamentals]);

  const key = metric === "revenue" ? "Revenue" : metric === "earnings" ? "Earnings" : "EPS";
  const color = metric === "revenue" ? fx.revenue : metric === "earnings" ? fx.earnings : fx.eps;
  const yFmt = (v: number) => metric === "eps" ? v.toFixed(1) : `${v}B`;
  const tipFmt = (v: any) => metric === "eps" ? `KES ${v}` : `KES ${v}B`;

  const margins = fundamentals.marginsHistory;

  return (
    <div className="space-y-8">
      {/* Growth trend */}
      <BarChartBlock
        title="Growth History"
        annual={data.filter(d => !d.forecast)}
        allowQuarterly
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


      {/* Revenue forecast range */}
      <div>
        <Eyebrow>Revenue Forecast Range (KES B)</Eyebrow>
        <div className="h-64 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fundamentals.revenueForecast} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="revBand" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={fx.revenue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={fx.revenue} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}B`} />
              <Tooltip
                content={
                  <ColorTooltip
                    format={(v) => (v == null ? "—" : `KES ${v}B`)}
                    colorFor={(e) =>
                      e.dataKey === "actual" ? fx.netIncome : e.dataKey === "mid" ? fx.revenue : fx.forecast
                    }
                  />
                }
              />
              <Area dataKey="high" stroke="none" fill="url(#revBand)" name="High" stackId={undefined as any} />
              <Area dataKey="low" stroke="none" fill="hsl(var(--background))" name="Low" />
              <Line type="monotone" dataKey="mid" stroke={fx.revenue} strokeWidth={2.5} dot={{ r: 3, fill: fx.revenue }} name="Consensus" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="actual" stroke={fx.netIncome} strokeWidth={2.5} dot={{ r: 3, fill: fx.netIncome }} name="Actual" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[
          { label: "Actual revenue", color: fx.netIncome },
          { label: "Consensus", color: fx.revenue },
          { label: "Forecast range", color: fx.forecast },
        ]} />
      </div>

      {/* Margins over time (multi-line) */}
      <div>
        <Eyebrow>Margins Trend</Eyebrow>
        <div className="h-64 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={margins} margin={{ top: 10, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<ColorTooltip format={(v) => `${v}%`} />} />
              <Line type="monotone" dataKey="gross" stroke={fx.grossMargin} strokeWidth={2} dot={false} name="Gross" />
              <Line type="monotone" dataKey="operating" stroke={fx.operatingMargin} strokeWidth={2} dot={false} name="Operating" />
              <Line type="monotone" dataKey="net" stroke={fx.netMargin} strokeWidth={2} dot={false} name="Net" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[
          { label: "Gross margin", color: fx.grossMargin },
          { label: "Operating margin", color: fx.operatingMargin },
          { label: "Net margin", color: fx.netMargin },
        ]} />
      </div>

      {/* EPS estimate trend (analyst drift) */}
      <div>
        <Eyebrow>Analyst EPS Estimate — Last 12 Months</Eyebrow>
        <div className="h-64 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fundamentals.epsEstimateTrend} margin={{ top: 10, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="month" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `KES ${v}`} domain={["auto", "auto"]} />
              <Tooltip content={<ColorTooltip format={(v) => `KES ${v}`} />} />
              <Line type="monotone" dataKey="est" stroke={fx.eps} strokeWidth={2.5} dot={{ r: 3, fill: fx.eps }} name="Consensus EPS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Consensus EPS", color: fx.eps }]} />
      </div>

      {/* Growth vs sector — hairline rows */}
      <div>
        <Eyebrow>Growth vs Sector Average</Eyebrow>
        <div className="border-t border-border/60">
          {fundamentals.growthMetrics.map(g => {
            const beat = g.value >= g.sector;
            return (
              <div key={g.label} className="py-3 border-b border-border/40 last:border-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{g.label}</span>
                  <span className="font-bold tabular" style={{ color: beat ? fx.positive : fx.negative }}>{g.value >= 0 ? "+" : ""}{g.value.toFixed(1)}%</span>
                </div>
                <div className="relative h-1.5 bg-muted rounded-full">
                  <div className="absolute top-0 h-full rounded-full" style={{ width: `${Math.min(100, Math.abs(g.value) * 4)}%`, background: beat ? fx.positive : fx.negative }} />
                  <div className="absolute top-[-3px] h-3 w-0.5" style={{ left: `${Math.min(100, g.sector * 4)}%`, background: fx.benchmark }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Sector avg: {g.sector.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

