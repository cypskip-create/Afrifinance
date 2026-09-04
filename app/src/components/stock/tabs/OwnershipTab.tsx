import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";

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
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>Insider Transactions</Eyebrow>
        </div>
        <div className="border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            Continua doesn't ingest an insider-trading disclosure feed yet — there's no corporate
            action type for it in the data layer (dividends, splits, bonus/rights issues, buybacks,
            and M&amp;A are tracked; insider trades aren't). Shown here so the tool is visibly
            present rather than silently missing, not filled with invented transactions.
          </p>
        </div>
      </div>
    </div>
  );
}