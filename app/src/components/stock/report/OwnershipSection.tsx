import { ReportSection, SubWidget } from "./ReportSection";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";

interface Props { fundamentals: Fundamentals }

const colorFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("institution")) return fx.institutional;
  if (n.includes("public") || n.includes("retail")) return fx.retail;
  if (n.includes("foreign")) return fx.foreign;
  if (n.includes("government")) return fx.government;
  if (n.includes("insider")) return fx.insider;
  return fx.public;
};

const WINDOWS = ["0-3 months", "3-6 months", "6-9 months", "9-12 months"];

/** Ownership Breakdown and Top Shareholders below are real (overlaid
 *  from useOwnership upstream). Insider Transactions has no real source
 *  — there's no insider-trading disclosure feed or corporate action type
 *  for it — so the table renders honestly at zero, in the same
 *  0–3/3–6/6–9/9–12 month layout, rather than inventing trades. */
export function OwnershipSection({ fundamentals }: Props) {
  const data = fundamentals.ownership.map(d => ({ ...d, color: colorFor(d.name) }));
  const total = data.reduce((s, d) => s + d.value, 0);
  const norm = data.map(d => ({ ...d, pct: total > 0 ? (d.value / total) * 100 : 0 }));

  return (
    <ReportSection number={7} title="Ownership" intro="Who are the major shareholders and have insiders been buying or selling?">
      <SubWidget number="7.1" title="Recent Insider Transactions" description="Continua has no insider-trading disclosure feed yet — shown honestly at zero rather than invented.">
        <div className="rounded-xl overflow-hidden border border-border/50">
          <div className="grid grid-cols-3 bg-muted/30 text-[10px] font-semibold uppercase tracking-wide">
            <span className="p-2">Period</span>
            <span className="p-2 text-right text-bear">Shares sold</span>
            <span className="p-2 text-right text-bull">Shares bought</span>
          </div>
          {WINDOWS.map((w) => (
            <div key={w} className="grid grid-cols-3 border-t border-border/40">
              <span className="p-2 text-[11px] text-muted-foreground">{w}</span>
              <span className="p-2 text-[11px] text-right tabular">0</span>
              <span className="p-2 text-[11px] text-right tabular">0</span>
            </div>
          ))}
        </div>
      </SubWidget>

      <SubWidget number="7.2" title="Ownership Breakdown" description="Real shareholder composition, from Continua's ownership data.">
        {norm.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No ownership data on file yet.</p>
        ) : (
          <>
            <div className="flex h-8 w-full rounded-md overflow-hidden">
              {norm.map(d => <div key={d.name} className="h-full" style={{ width: `${d.pct}%`, background: d.color }} title={`${d.name}: ${d.pct.toFixed(1)}%`} />)}
            </div>
            <div className="mt-3 space-y-2">
              {norm.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="truncate">{d.name}</span>
                  </div>
                  <span className="font-bold tabular">{d.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="section-eyebrow mt-4 mb-2">Top Shareholders</p>
        <div className="divide-y divide-border/40">
          {fundamentals.topShareholders.map(s => (
            <div key={s.name} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.type}</p>
              </div>
              <span className="text-xs font-bold tabular shrink-0">{s.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </SubWidget>
    </ReportSection>
  );
}