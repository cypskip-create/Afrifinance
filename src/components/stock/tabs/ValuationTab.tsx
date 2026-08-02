import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, CartesianGrid } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx, axisStyle, gridStyle } from "@/lib/chartPalette";
import { ColorTooltip, ChartKey } from "@/components/charts/ChartTooltip";


interface Props { price: number; pe: string; fundamentals: Fundamentals }

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function ValuationTab({ price, pe, fundamentals }: Props) {
  const fair = fundamentals.fairValue;
  const upside = ((fair - price) / price) * 100;
  const tag = upside > 10 ? "Undervalued" : upside < -10 ? "Overvalued" : "Fairly Valued";
  const tagColor = upside > 10 ? fx.strong : upside < -10 ? fx.weak : fx.ok;

  const clamp = Math.max(-50, Math.min(50, upside));
  const angle = ((clamp + 50) / 100) * 180;
  const cx = 100, cy = 100, rad = 78;
  const nx = cx + rad * Math.cos((180 - angle) * Math.PI / 180);
  const ny = cy - rad * Math.sin((180 - angle) * Math.PI / 180);

  const comparison = [
    { metric: "P/E", company: parseFloat(pe) || 0, sector: fundamentals.peSector },
    { metric: "P/B", company: +(price / 25).toFixed(2), sector: fundamentals.pbSector },
    { metric: "EV/EBITDA", company: fundamentals.evEbitda, sector: fundamentals.evEbitdaSector },
  ];

  const targets = fundamentals.analystTargets;

  return (
    <div className="space-y-8">
      {/* Fair value gauge */}
      <div>
        <Eyebrow>Fair Value Estimate</Eyebrow>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div>
            <p className="text-2xl font-bold tabular">KES {fair.toFixed(2)}</p>
            <p className="text-xs font-semibold tabular" style={{ color: tagColor }}>
              {upside >= 0 ? "+" : ""}{upside.toFixed(1)}% vs current
            </p>
          </div>
          <Badge variant="outline" style={{ color: tagColor, borderColor: `${tagColor}55` }} className="text-[10px]">{tag}</Badge>
        </div>
        <div className="flex justify-center mt-2">
          <svg viewBox="0 0 200 118" className="w-full max-w-[280px]">
            <defs>
              <linearGradient id="valgauge" x1="0%" x2="100%">
                <stop offset="0%" stopColor={fx.weak} />
                <stop offset="50%" stopColor={fx.ok} />
                <stop offset="100%" stopColor={fx.strong} />
              </linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="url(#valgauge)" strokeWidth="12" fill="none" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="hsl(var(--foreground))" />
            <text x="20" y="115" fontSize="9" fill="hsl(var(--muted-foreground))">Overvalued</text>
            <text x="150" y="115" fontSize="9" fill="hsl(var(--muted-foreground))">Undervalued</text>
          </svg>
        </div>
      </div>

      {/* Analyst price target consensus */}
      <div>
        <Eyebrow>Price Target Consensus · {targets.count} analysts</Eyebrow>
        <div className="border-t border-border/60 pt-3">
          <div className="relative h-9 bg-muted/40 rounded-full">
            {/* Range bar */}
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
              style={{ left: "8%", right: "8%", background: `linear-gradient(90deg, ${fx.weak}, ${fx.ok}, ${fx.strong})` }} />
            {/* Low / Avg / High markers */}
            {[
              { label: "Low", val: targets.low, color: fx.weak, pos: "12%" },
              { label: "Avg", val: targets.avg, color: fx.target, pos: "50%" },
              { label: "High", val: targets.high, color: fx.strong, pos: "88%" },
            ].map(m => (
              <div key={m.label} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: m.pos }}>
                <div className="h-4 w-0.5" style={{ background: m.color }} />
                <span className="text-[9px] font-semibold tabular mt-1" style={{ color: m.color }}>{m.val}</span>
              </div>
            ))}
            {/* Current price */}
            <div className="absolute -bottom-6 -translate-x-1/2 text-[9px] font-semibold text-muted-foreground tabular"
              style={{ left: `${Math.max(4, Math.min(96, ((price - targets.low) / Math.max(0.01, targets.high - targets.low)) * 100))}%` }}>
              ▲ Now KES {price.toFixed(2)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-9 pt-2 border-t border-border/40">
            <div className="text-center"><p className="text-[10px] text-muted-foreground">Buy</p><p className="text-sm font-bold tabular" style={{ color: fx.buy }}>{targets.buy}</p></div>
            <div className="text-center"><p className="text-[10px] text-muted-foreground">Hold</p><p className="text-sm font-bold tabular" style={{ color: fx.hold }}>{targets.hold}</p></div>
            <div className="text-center"><p className="text-[10px] text-muted-foreground">Sell</p><p className="text-sm font-bold tabular" style={{ color: fx.sell }}>{targets.sell}</p></div>
          </div>
        </div>
      </div>

      {/* Multiples vs sector */}
      <div>
        <Eyebrow>Valuation Multiples vs Sector</Eyebrow>
        <div className="h-52 border-t border-border/60 pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison} margin={{ top: 12, right: 8, bottom: 0, left: -18 }} barCategoryGap="40%" barGap={6}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="metric" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.35 }}
                content={<ColorTooltip colorFor={(e) => (e.dataKey === "company" ? fx.revenue : fx.foreign)} />}
              />
              <Bar dataKey="company" radius={[6, 6, 0, 0]} name="Company" fill={fx.revenue}>
                <LabelList dataKey="company" position="top" style={{ fontSize: 9, fill: fx.revenue }} />
              </Bar>
              <Bar dataKey="sector" radius={[6, 6, 0, 0]} name="Sector" fill={fx.foreign}>
                <LabelList dataKey="sector" position="top" style={{ fontSize: 9, fill: fx.foreign }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartKey items={[
          { label: "Company multiple", color: fx.revenue },
          { label: "Sector average", color: fx.foreign },
        ]} />
      </div>

    </div>
  );
}
