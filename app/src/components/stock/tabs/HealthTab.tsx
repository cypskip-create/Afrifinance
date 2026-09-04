import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { fx } from "@/lib/chartPalette";
import { useStockFinancials } from "@/hooks/useStockFinancials";
import { useResearch } from "@/hooks/useResearch";
import { InfoTip } from "@/components/portfolio/InfoTip";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{children}</p>
);

function fmtB(v: number | undefined | null) {
  if (v == null) return "—";
  return `KES ${(v / 1e9).toFixed(2)}B`;
}

/** Real current-period balance sheet and cash flow (financialsApi's
 *  latest full statement bundle), plus a real health checklist from
 *  research ratios. Continua's history endpoint only carries
 *  revenue/netIncome/eps, not balance-sheet or cash-flow line items, so
 *  there's no real multi-year Cash vs Debt or Share Count trend to draw
 *  — those are shown as a current snapshot instead of a fabricated
 *  chart. Share dilution uses the same EPS-implied-shares approach as
 *  the portfolio's Share Dilution tool. */
export function HealthTab({ symbol }: { symbol: string }) {
  const { latest, history, isLoading } = useStockFinancials(symbol);
  const { research, isLoading: researchLoading } = useResearch(symbol);
  const ratios = research?.ratios;

  const netCash = latest?.cash != null && latest?.totalDebt != null ? latest.cash - latest.totalDebt : null;

  const [mostRecent, prior] = [...history].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const impliedDilution = mostRecent?.eps && prior?.eps && mostRecent.eps !== 0 && prior.eps !== 0
    ? (() => {
        const latestShares = mostRecent.netIncome / mostRecent.eps;
        const priorShares = prior.netIncome / prior.eps;
        return priorShares !== 0 ? ((latestShares - priorShares) / Math.abs(priorShares)) * 100 : null;
      })()
    : null;

  const checks: { label: string; status: "pass" | "fail" | "unknown" }[] = [
    { label: "More cash than debt", status: netCash == null ? "unknown" : netCash >= 0 ? "pass" : "fail" },
    { label: "Current ratio above 1.0x", status: ratios?.currentRatio == null ? "unknown" : ratios.currentRatio > 1 ? "pass" : "fail" },
    { label: "Debt to equity is manageable (below 100%)", status: ratios?.debtToEquity == null ? "unknown" : ratios.debtToEquity < 100 ? "pass" : "fail" },
    { label: "Interest well covered by earnings (>3x)", status: ratios?.interestCoverage == null ? "unknown" : ratios.interestCoverage > 3 ? "pass" : "fail" },
    { label: "Positive operating cash flow", status: latest?.operatingCashFlow == null ? "unknown" : latest.operatingCashFlow > 0 ? "pass" : "fail" },
    { label: "Share count not meaningfully diluted", status: impliedDilution == null ? "unknown" : impliedDilution < 5 ? "pass" : "fail" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Balance Sheet Snapshot</Eyebrow>
          <InfoTip>Most recently reported period on file — Continua doesn't have a multi-year balance-sheet time series yet, so this is a snapshot rather than a trend.</InfoTip>
        </div>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-3">Loading…</p>
        ) : !latest ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">No financial statements on file for {symbol} yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3">
            <div><p className="text-[9.5px] text-muted-foreground">Cash &amp; equivalents</p><p className="text-sm font-bold tabular">{fmtB(latest.cash)}</p></div>
            <div><p className="text-[9.5px] text-muted-foreground">Total debt</p><p className="text-sm font-bold tabular">{fmtB(latest.totalDebt)}</p></div>
            <div><p className="text-[9.5px] text-muted-foreground">Net {netCash != null && netCash < 0 ? "debt" : "cash"}</p><p className="text-sm font-bold tabular" style={{ color: netCash == null ? undefined : netCash >= 0 ? fx.strong : fx.weak }}>{netCash != null ? fmtB(Math.abs(netCash)) : "—"}</p></div>
            <div><p className="text-[9.5px] text-muted-foreground">Total equity</p><p className="text-sm font-bold tabular">{fmtB(latest.totalEquity)}</p></div>
          </div>
        )}
      </div>

      <div>
        <Eyebrow>Cash Flow Snapshot</Eyebrow>
        {latest ? (
          <div className="grid grid-cols-3 gap-4 border-t border-border/60 pt-3">
            <div><p className="text-[9.5px] text-muted-foreground">Operating CF</p><p className="text-sm font-bold tabular">{fmtB(latest.operatingCashFlow)}</p></div>
            <div><p className="text-[9.5px] text-muted-foreground">Free cash flow</p><p className="text-sm font-bold tabular">{fmtB(latest.freeCashFlow)}</p></div>
            <div><p className="text-[9.5px] text-muted-foreground">Capex</p><p className="text-sm font-bold tabular">{fmtB(latest.capex)}</p></div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">No cash flow statement on file yet.</p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Eyebrow>Share Dilution</Eyebrow>
          <InfoTip>Implied from reported net income ÷ EPS across the two most recent annual periods — a derived figure, not a direct disclosure.</InfoTip>
        </div>
        {impliedDilution == null ? (
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">Need two full annual periods with usable EPS to compute this.</p>
        ) : (
          <p className={`text-lg font-bold tabular border-t border-border/60 pt-3 ${impliedDilution <= 0.5 ? "text-bull" : "text-bear"}`}>
            {impliedDilution >= 0 ? "+" : ""}{impliedDilution.toFixed(2)}% <span className="text-xs font-normal text-muted-foreground">implied YoY change in share count</span>
          </p>
        )}
      </div>

      <div>
        <Eyebrow>Health Checklist</Eyebrow>
        {researchLoading ? (
          <p className="text-xs text-muted-foreground py-3">Loading…</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}