import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Fundamentals } from "@/data/stockFundamentals";
import { fx } from "@/lib/chartPalette";
import { BarChartBlock } from "@/components/charts/BarChartBlock";
import { useDividendHistory } from "@/hooks/useDividendHistory";
import { useResearch } from "@/hooks/useResearch";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";
import { InfoTip } from "@/components/portfolio/InfoTip";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

export function DividendsTab({ divYield, annualDividend, fundamentals, symbol }: {
  divYield: string; annualDividend: string; fundamentals: Fundamentals; symbol: string;
}) {
  const { history: dividendHistory } = useDividendHistory(symbol);
  const { research } = useResearch(symbol);
  const { averages: benchmark } = useMarketBenchmark();

  const data = dividendHistory.length > 0
    ? dividendHistory.map((d, i, arr) => ({ ...d, color: d.dps >= (i > 0 ? arr[i - 1].dps : d.dps) ? fx.positive : fx.negative }))
    : fundamentals.dividendHistory.map((d, i, arr) => {
        const prev = i > 0 ? arr[i - 1].dps : d.dps;
        return { ...d, color: d.dps >= prev ? fx.positive : fx.negative };
      });
  const payout = fundamentals.payoutRatio;
  const payoutColor = payout < 60 ? fx.strong : payout < 80 ? fx.ok : fx.weak;

  // Real dividend checks, same signals as the portfolio's Dividend
  // Quality tool — reliability and growth from confirmed payout history,
  // not a forecast.
  const ratios = research?.ratios;
  const sorted = [...dividendHistory].sort((a, b) => a.year.localeCompare(b.year));
  const lastTwo = sorted.slice(-2);
  const checks: { label: string; status: "pass" | "fail" | "unknown" }[] = [
    { label: "Pays a dividend", status: sorted.length > 0 ? "pass" : "fail" },
    { label: "At least 3 years of payouts on record", status: sorted.length >= 3 ? "pass" : sorted.length > 0 ? "fail" : "unknown" },
    { label: "Dividend per share grew last year", status: lastTwo.length < 2 ? "unknown" : lastTwo[1].dps >= lastTwo[0].dps ? "pass" : "fail" },
    { label: "Yield above market sample", status: ratios?.dividendYield == null || benchmark.dividendYield == null ? "unknown" : ratios.dividendYield > benchmark.dividendYield ? "pass" : "fail" },
    { label: "Sustainable payout ratio (below 75%)", status: ratios?.payoutRatio != null ? (ratios.payoutRatio < 0.75 ? "pass" : "fail") : (payout < 75 ? "pass" : "fail") },
  ];

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

      <BarChartBlock
        title="Dividend Per Share"
        annual={data}
        xKey="year"
        series={[{ key: "dps", label: "Dividend per share", color: fx.positive }]}
        colorFor={(row) => row.color}
        valueFmt={(v) => `KES ${v}`}
      />

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
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Dividend Sustainability Checks</Eyebrow>
          <InfoTip>Built from real, confirmed payout history and current ratios — the same checks that power the portfolio's Dividend Quality tool, applied to one company.</InfoTip>
        </div>
        <div className="border-t border-border/60">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 py-2.5 border-b border-border/40 last:border-0">
              {c.status === "pass" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: fx.positive }} />
              ) : c.status === "fail" ? (
                <XCircle className="h-4 w-4 shrink-0" style={{ color: fx.negative }} />
              ) : (
                <MinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-xs">{c.label}</span>
              {c.status === "unknown" && <span className="text-[10px] text-muted-foreground ml-auto">No data</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}