import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ReportSection, SubWidget } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { KeyInfoUpdates } from "./KeyInfoUpdates";
import { useDividendHistory } from "@/hooks/useDividendHistory";
import { useResearch } from "@/hooks/useResearch";
import { useMarketBenchmark } from "@/hooks/useMarketBenchmark";
import { useStockFinancials } from "@/hooks/useStockFinancials";

interface Props { symbol: string; currency: string; divYield: string; annualDividend: string }

function Donut({ pct, label, color }: { pct: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: Math.min(100, Math.max(0, pct)) }, { v: 100 - Math.min(100, Math.max(0, pct)) }]} dataKey="v" innerRadius={44} outerRadius={60} startAngle={90} endAngle={-270} stroke="none">
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

export function DividendsSection({ symbol, currency, divYield, annualDividend }: Props) {
  const { history: dividendHistory, isLoading: divLoading } = useDividendHistory(symbol);
  const { research } = useResearch(symbol);
  const { averages: benchmark } = useMarketBenchmark();
  const { latest } = useStockFinancials(symbol);
  const ratios = research?.ratios;

  const sorted = [...dividendHistory].sort((a, b) => a.year.localeCompare(b.year));
  const stable = sorted.length >= 3;
  const growing = sorted.length >= 2 && sorted[sorted.length - 1].dps >= sorted[sorted.length - 2].dps;
  const payout = ratios?.payoutRatio != null ? ratios.payoutRatio * 100 : null;
  const cashPayout = latest?.freeCashFlow && latest.freeCashFlow > 0 && payout != null
    ? Math.min(100, ((parseFloat(annualDividend) || 0) * 1e0) / (latest.freeCashFlow / 1e9) * 100)
    : null;

  const checks = [
    { label: "Pays a dividend", status: sorted.length > 0 ? "pass" as const : "fail" as const },
    { label: "Stable dividend (last 10 years)", status: sorted.length >= 5 ? "pass" as const : sorted.length > 0 ? "unknown" as const : "unknown" as const },
    { label: "Growing dividend", status: sorted.length >= 2 ? (growing ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Dividend covered by earnings", status: payout != null ? (payout < 100 ? "pass" as const : "fail" as const) : "unknown" as const },
  ];

  return (
    <ReportSection number={5} title="Dividend">
      <CriteriaChecklist
        checks={checks}
        narrative={sorted.length === 0 ? `${symbol} doesn't currently pay a dividend, or none is on file yet.` : `${symbol} has paid dividends in ${sorted.length} of the years on file. ${payout != null ? `${payout.toFixed(0)}% of earnings are paid out.` : ""}`}
      />

      <KeyInfoUpdates
        rows={[
          { label: "Dividend yield", value: `${divYield}%`, highlight: true },
          { label: "Annual dividend", value: `${currency}${annualDividend}`, highlight: true },
          { label: "Payout ratio", value: payout != null ? `${payout.toFixed(0)}%` : "n/a" },
          { label: "Years of payment history on file", value: String(sorted.length) },
        ]}
        updates={[]}
        updatesTitle="Recent dividend updates"
      />

      <SubWidget number="5.1" title="Stability and Growth of Payments" description="Real dividend-per-share history — no forecast is shown since Continua has no analyst dividend estimates.">
        {divLoading ? <p className="text-xs text-muted-foreground py-6">Loading…</p> : sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6">No dividend history on file for {symbol} yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {sorted.map((d) => (
              <div key={d.year} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full rounded-t bg-bull/70" style={{ height: `${(d.dps / Math.max(...sorted.map(s => s.dps), 1)) * 100}%` }} />
                <span className="text-[9px] text-muted-foreground mt-1">{d.year}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-2">{!stable ? "Insufficient years on file to determine long-term stability." : "Real, confirmed payout history."}</p>
      </SubWidget>

      <SubWidget number="5.2" title="Dividend Yield vs Market" description="Company yield against the same NSE market-cap sample used across Continua's benchmarks.">
        <div className="flex items-end gap-4 h-32">
          <Column label="Company" value={parseFloat(divYield)} max={Math.max(parseFloat(divYield) || 0, benchmark.dividendYield ?? 0, 1)} color="hsl(217 91% 60%)" />
          <Column label="Market Avg" value={benchmark.dividendYield} max={Math.max(parseFloat(divYield) || 0, benchmark.dividendYield ?? 0, 1)} color="hsl(330 81% 60%)" />
        </div>
      </SubWidget>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SubWidget number="5.3" title="Earnings Payout to Shareholders">
          {payout == null ? <p className="text-xs text-muted-foreground py-6 text-center">No payout ratio on file.</p> : <Donut pct={payout} label="Paid as dividend" color={payout > 90 ? "hsl(var(--bear))" : "hsl(var(--bull))"} />}
        </SubWidget>
        <SubWidget number="5.4" title="Cash Payout to Shareholders">
          {cashPayout == null ? <p className="text-xs text-muted-foreground py-6 text-center">{sorted.length === 0 ? "Does not pay a dividend." : "Not enough cash flow data on file to compute this."}</p> : <Donut pct={cashPayout} label="Of free cash flow" color={cashPayout > 90 ? "hsl(var(--bear))" : "hsl(var(--bull))"} />}
        </SubWidget>
      </div>
    </ReportSection>
  );
}

function Column({ label, value, max, color }: { label: string; value: number | null; max: number; color: string }) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 flex flex-col items-center justify-end h-full">
      <span className="text-[11px] font-bold mb-1">{value != null ? `${value.toFixed(1)}%` : "n/a"}</span>
      <div className="w-full rounded-t" style={{ height: `${pct}%`, background: color, minHeight: 4 }} />
      <span className="text-[9px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}