import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props { fundamentals: Fundamentals }

const levelToScore = (l: string) => l === "Low" ? 80 : l === "Medium" ? 50 : 20;
const toneFor = (l: string) =>
  l === "Low" ? "text-bull border-bull/40" : l === "Medium" ? "text-chart-3 border-chart-3/40" : "text-bear border-bear/40";

export function RiskTab({ fundamentals }: Props) {
  const radarData = fundamentals.riskFactors.map(r => ({
    factor: r.label.replace(" risk", "").replace(" exposure", ""),
    safety: levelToScore(r.level),
  }));

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Risk Snowflake — higher is safer</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="Safety" dataKey="safety" stroke="hsl(var(--bull))" fill="hsl(var(--bull))" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-xs font-bold">Key Risk Factors</h4>
          {fundamentals.riskFactors.map(r => (
            <div key={r.label} className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.note}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${toneFor(r.level)}`}>{r.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
