import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";



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

      <BarChartBlock
        title="Volatility vs Sector (Annualized %)"
        annual={fundamentals.volatility}
        annualCount={4}
        xKey="period"
        series={[
          { key: "company", label: "Company volatility", color: fx.revenue },
          { key: "sector", label: "Sector volatility", color: fx.foreign },
        ]}
        yFmt={(v) => `${v}%`}
        valueFmt={(v) => `${Number(v).toFixed(1)}%`}
      />




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
