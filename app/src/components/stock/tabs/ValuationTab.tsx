import { Badge } from "@/components/ui/badge";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";



interface Props { price: number; pe: string; fundamentals: Fundamentals; onSeePerformance?: () => void }

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function ValuationTab({ price, pe, fundamentals, onSeePerformance }: Props) {
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

      {/* Analyst consensus — quick pointer only; full price-target breakdown lives in the Performance group */}
      <div>
        <Eyebrow>Analyst Consensus</Eyebrow>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            {targets.count} analysts · avg target <span className="font-semibold tabular text-foreground">KES {targets.avg}</span>
          </p>
          <button data-small-target onClick={onSeePerformance} disabled={!onSeePerformance}>
            <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-muted/60">See Performance →</Badge>
          </button>
        </div>
      </div>

      {/* Multiples vs sector */}
      <BarChartBlock
        title="Valuation Multiples vs Sector"
        annual={comparison}
        xKey="metric"
        series={[
          { key: "company", label: "Company multiple", color: fx.revenue },
          { key: "sector", label: "Sector average", color: fx.foreign },
        ]}
        valueFmt={(v) => `${Number(v).toFixed(2)}x`}
        yFmt={(v) => `${v}x`}
      />


    </div>
  );
}