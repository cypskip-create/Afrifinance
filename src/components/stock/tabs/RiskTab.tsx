import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx, axisStyle, gridStyle } from "@/lib/chartPalette";
import { ColorTooltip, ChartKey } from "@/components/charts/ChartTooltip";


const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

const levelScore = (l: string) => l === "Low" ? 80 : l === "Medium" ? 50 : 20;
const levelColor = (l: string) => l === "Low" ? fx.strong : l === "Medium" ? fx.ok : fx.weak;

export function RiskTab({ fundamentals }: { fundamentals: Fundamentals }) {
  const radar = fundamentals.riskFactors.map(r => ({
    factor: r.label.replace(" risk", "").replace(" exposure", ""),
    safety: levelScore(r.level),
  }));

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Risk Snowflake — higher is safer</Eyebrow>
        <div className="h-56 border-t border-border/60 pt-2">
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
        <Eyebrow>Volatility vs Sector (Annualized %)</Eyebrow>
        <div className="h-44 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundamentals.volatility} margin={{ top: 10, right: 8, bottom: 0, left: -14 }} barCategoryGap="40%" barGap={6}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="period" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.35 }}
                content={<ColorTooltip format={(v) => `${v}%`} colorFor={(e) => (e.dataKey === "company" ? fx.revenue : fx.foreign)} />}
              />
              <Bar dataKey="company" name="Company" fill={fx.revenue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sector" name="Sector" fill={fx.foreign} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[{ label: "Company volatility", color: fx.revenue }, { label: "Sector volatility", color: fx.foreign }]} />
      </div>



      <div>
        <Eyebrow>Key Risk Factors</Eyebrow>
        <div className="border-t border-border/60">
          {fundamentals.riskFactors.map(r => (
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
