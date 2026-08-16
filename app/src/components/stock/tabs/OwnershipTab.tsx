import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

// Reassign semantic colors to ownership buckets by matching name.
const colorFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("institution")) return fx.institutional;
  if (n.includes("public") || n.includes("retail")) return fx.retail;
  if (n.includes("foreign")) return fx.foreign;
  if (n.includes("government")) return fx.government;
  if (n.includes("insider")) return fx.insider;
  return fx.public;
};

export function OwnershipTab({ fundamentals }: { fundamentals: Fundamentals }) {
  const data = fundamentals.ownership.map(d => ({ ...d, color: colorFor(d.name) }));
  const total = data.reduce((s, d) => s + d.value, 0);
  const norm = data.map(d => ({ ...d, pct: (d.value / total) * 100 }));

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Ownership Breakdown</Eyebrow>
        <div className="border-t border-border/60 pt-3">
          {/* Horizontal stacked bar — institutional visualization */}
          <div className="flex h-8 w-full rounded-md overflow-hidden">
            {norm.map(d => (
              <div key={d.name} className="h-full transition-all hover:opacity-80"
                title={`${d.name}: ${d.pct.toFixed(1)}%`}
                style={{ width: `${d.pct}%`, background: d.color }} />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {norm.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                  <span className="truncate">{d.name}</span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                  <span className="font-bold tabular w-10 text-right">{d.pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Eyebrow>Top Shareholders</Eyebrow>
        <div className="border-t border-border/60">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 py-2 border-b border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Holder</span><span>Type</span><span className="text-right">Stake</span>
          </div>
          {fundamentals.topShareholders.map(s => (
            <div key={s.name} className="grid grid-cols-[1fr_auto_auto] gap-4 py-2.5 border-b border-border/40 last:border-0 items-center">
              <span className="text-xs font-medium truncate">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">{s.type}</span>
              <span className="text-xs font-bold tabular text-right">{s.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Eyebrow>Insider Transactions</Eyebrow>
          <Badge variant="outline" className="text-[10px] text-bull border-bull/40 gap-1 mb-2">
            <TrendingUp className="h-2.5 w-2.5" /> Net buying
          </Badge>
        </div>
        <div className="border-t border-border/60">
          {fundamentals.insiderTrades.map(t => (
            <div key={t.date + t.insider} className="grid grid-cols-[auto_1fr_auto] gap-3 py-3 border-b border-border/40 last:border-0 items-center">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${t.type === "Buy" ? fx.positive : fx.negative}22`, color: t.type === "Buy" ? fx.positive : fx.negative }}>
                {t.type === "Buy" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{t.insider}</p>
                <p className="text-[10px] text-muted-foreground">{t.role} · {t.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tabular" style={{ color: t.type === "Buy" ? fx.positive : fx.negative }}>
                  {t.type} · {t.shares.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground tabular">KES {(t.value / 1e6).toFixed(1)}M</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}