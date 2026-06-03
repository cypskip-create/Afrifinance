import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";

interface Props {
  price: number;
  pe: string;
  fundamentals: Fundamentals;
}

export function ValuationTab({ price, pe, fundamentals }: Props) {
  const fair = fundamentals.fairValue;
  const upside = ((fair - price) / price) * 100;
  const tag = upside > 10 ? "Undervalued" : upside < -10 ? "Overvalued" : "Fairly Valued";
  const tone = upside > 10 ? "text-bull" : upside < -10 ? "text-bear" : "text-accent";

  // Semi-circle gauge: needle position based on upside (-50% .. +50%)
  const clamp = Math.max(-50, Math.min(50, upside));
  const angle = ((clamp + 50) / 100) * 180; // 0..180 deg
  const cx = 100, cy = 100, rad = 80;
  const needleX = cx + rad * Math.cos((180 - angle) * Math.PI / 180);
  const needleY = cy - rad * Math.sin((180 - angle) * Math.PI / 180);

  const comparison = [
    { metric: "P/E", company: parseFloat(pe) || 0, sector: fundamentals.peSector },
    { metric: "P/B", company: +(price / 25).toFixed(2), sector: fundamentals.pbSector },
    { metric: "EV/EBITDA", company: fundamentals.evEbitda, sector: fundamentals.evEbitdaSector },
  ];

  return (
    <div className="space-y-3">
      <Card className="soft-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fair Value Estimate</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold">KES {fair.toFixed(2)}</span>
                <span className={`text-xs font-semibold ${tone}`}>{upside >= 0 ? "+" : ""}{upside.toFixed(1)}%</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] ${tone}`}>{tag}</Badge>
          </div>
          {/* SVG Gauge */}
          <div className="flex justify-center">
            <svg viewBox="0 0 200 120" className="w-full max-w-[260px] h-auto">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="hsl(var(--bear))" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(var(--bull))" />
                </linearGradient>
              </defs>
              <path d={`M 20 100 A 80 80 0 0 1 180 100`} stroke="url(#gaugeGrad)" strokeWidth="14" fill="none" strokeLinecap="round" />
              <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="6" fill="hsl(var(--foreground))" />
              <text x="20" y="118" fontSize="9" fill="hsl(var(--muted-foreground))">Overvalued</text>
              <text x="155" y="118" fontSize="9" fill="hsl(var(--muted-foreground))">Undervalued</text>
            </svg>
          </div>
          <p className={`text-xs text-center mt-1 ${tone} font-medium`}>
            {upside >= 0 ? "Trading below" : "Trading above"} fair value by {Math.abs(upside).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold mb-2">Valuation Multiples vs Sector</h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="company" radius={[6, 6, 0, 0]} name="Company">
                  {comparison.map((c, i) => (
                    <Cell key={i} fill={c.company < c.sector ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                  ))}
                </Bar>
                <Bar dataKey="sector" radius={[6, 6, 0, 0]} fill="hsl(var(--muted))" name="Sector" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">Lower vs sector = cheaper relative to peers</p>
        </CardContent>
      </Card>
    </div>
  );
}
