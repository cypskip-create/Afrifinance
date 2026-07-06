import { CheckCircle2, XCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx, tooltipStyle, axisStyle, gridStyle } from "@/lib/chartPalette";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function DividendsTab({ divYield, annualDividend, fundamentals }: {
  divYield: string; annualDividend: string; fundamentals: Fundamentals;
}) {
  const data = fundamentals.dividendHistory;
  const payout = fundamentals.payoutRatio;
  const payoutColor = payout < 60 ? fx.strong : payout < 80 ? fx.ok : fx.weak;

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Income Snapshot</Eyebrow>
        <div className="grid grid-cols-3 border-t border-border/60 pt-3 gap-4">
          <div><p className="text-[10px] text-muted-foreground">Yield</p><p className="text-lg font-bold tabular" style={{ color: fx.positive }}>{divYield}%</p></div>
          <div><p className="text-[10px] text-muted-foreground">Annual DPS</p><p className="text-lg font-bold tabular">KES {annualDividend}</p></div>
          <div><p className="text-[10px] text-muted-foreground">Payout ratio</p><p className="text-lg font-bold tabular" style={{ color: payoutColor }}>{payout.toFixed(0)}%</p></div>
        </div>
      </div>

      <div>
        <Eyebrow>Dividend Per Share — 10 Year History</Eyebrow>
        <div className="h-48 border-t border-border/60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }} barCategoryGap="18%">
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="year" {...axisStyle} />
              <YAxis {...axisStyle} tickFormatter={(v) => `${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `KES ${v}`} />
              <Bar dataKey="dps" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => {
                  const prev = i > 0 ? data[i - 1].dps : d.dps;
                  return <Cell key={i} fill={d.dps >= prev ? fx.positive : fx.negative} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Green = growing · Red = cut vs prior year</p>
      </div>

      <div>
        <Eyebrow>Payout Sustainability</Eyebrow>
        <div className="border-t border-border/60 pt-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">Earnings paid as dividends</span>
            <span className="font-bold tabular" style={{ color: payoutColor }}>{payout.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, payout)}%`, background: payoutColor }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {payout < 60 ? "Healthy — well covered by earnings" : payout < 80 ? "Moderate — monitor sustainability" : "High — limited buffer for cuts"}
          </p>
        </div>
      </div>

      <div>
        <Eyebrow>Dividend Sustainability Checks</Eyebrow>
        <div className="border-t border-border/60">
          {fundamentals.dividendChecks.map(c => (
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
