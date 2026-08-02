import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx, axisStyle, gridStyle } from "@/lib/chartPalette";
import { ColorTooltip, ChartKey } from "@/components/charts/ChartTooltip";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);


export function HealthTab({ fundamentals }: { fundamentals: Fundamentals }) {
  const cd = useMemo(() => fundamentals.cashVsDebt.map(r => ({
    year: r.year,
    Cash: +(r.cash / 1e9).toFixed(2),
    Debt: +(r.debt / 1e9).toFixed(2),
  })), [fundamentals]);

  const cf = fundamentals.operatingCashFlow.map(r => ({ year: r.year, CashFlow: +(r.cf / 1e9).toFixed(2) }));
  const fcf = fundamentals.freeCashFlowTrend;
  const latest = cd[cd.length - 1];
  const netCash = latest ? latest.Cash - latest.Debt : 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <Eyebrow>Cash vs Debt (KES B)</Eyebrow>
          <p className="text-xs font-semibold tabular" style={{ color: netCash >= 0 ? fx.cash : fx.debt }}>
            Net {netCash >= 0 ? "cash" : "debt"}: KES {Math.abs(netCash).toFixed(1)}B
          </p>
        </div>
        <div className="h-56 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd} margin={{ top: 10, right: 8, bottom: 0, left: -14 }} barCategoryGap="34%">
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}B`} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.35 }}
                content={<ColorTooltip format={(v) => `KES ${v}B`} colorFor={(e) => (e.dataKey === "Cash" ? fx.cash : fx.debt)} />}
              />
              <Bar dataKey="Cash" stackId="a" fill={fx.cash} />
              <Bar dataKey="Debt" stackId="a" fill={fx.debt} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Cash & equivalents", color: fx.cash }, { label: "Total debt", color: fx.debt }]} />
      </div>

      <div>
        <Eyebrow>Operating Cash Flow</Eyebrow>
        <div className="h-40 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cf} margin={{ top: 5, right: 8, bottom: 0, left: -14 }}>
              <defs>
                <linearGradient id="ocfg" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={fx.fcf} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={fx.fcf} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}B`} />
              <Tooltip content={<ColorTooltip format={(v) => `KES ${v}B`} colorFor={() => fx.fcf} />} />
              <Area type="monotone" dataKey="CashFlow" stroke={fx.fcf} strokeWidth={2.2} fill="url(#ocfg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Operating cash flow", color: fx.fcf }]} />
      </div>

      <div>
        <Eyebrow>Free Cash Flow vs Capex</Eyebrow>
        <div className="h-44 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fcf} margin={{ top: 10, right: 8, bottom: 0, left: -14 }} barCategoryGap="36%">
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}B`} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.35 }}
                content={<ColorTooltip format={(v) => `KES ${v}B`} colorFor={(e) => (e.dataKey === "fcf" ? fx.fcf : fx.liabilities)} />}
              />
              <Bar dataKey="fcf" name="Free Cash Flow" fill={fx.fcf} radius={[4, 4, 0, 0]} />
              <Bar dataKey="capex" name="Capex" fill={fx.liabilities} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Free cash flow", color: fx.fcf }, { label: "Capital expenditure", color: fx.liabilities }]} />
      </div>

      <div>
        <Eyebrow>Share Count (Dilution History, B)</Eyebrow>
        <div className="h-36 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fundamentals.shareCount} margin={{ top: 10, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} domain={["auto", "auto"]} />
              <Tooltip content={<ColorTooltip format={(v) => `${v}B shares`} colorFor={() => fx.equity} />} />
              <Line type="monotone" dataKey="shares" stroke={fx.equity} strokeWidth={2} dot={{ r: 3, fill: fx.equity }} name="Shares outstanding" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Shares outstanding", color: fx.equity }]} />
      </div>


      <div>
        <Eyebrow>Health Checklist</Eyebrow>
        <div className="border-t border-border/60">
          {fundamentals.healthChecks.map(c => (
            <div key={c.label} className="flex items-center gap-2 py-2.5 border-b border-border/40 last:border-0">
              {c.ok
                ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: fx.positive }} />
                : <XCircle className="h-4 w-4 shrink-0" style={{ color: fx.negative }} />}
              <span className="text-xs">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
