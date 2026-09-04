import { ReportSection, SubWidget } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { KeyInfoUpdates } from "./KeyInfoUpdates";
import { useStockFinancials } from "@/hooks/useStockFinancials";
import { useResearch } from "@/hooks/useResearch";

interface Props { symbol: string; currency: string }

function fmtB(v: number | undefined | null) {
  if (v == null) return "—";
  return `${(v / 1e9).toFixed(2)}B`;
}

export function FinancialHealthSection({ symbol, currency }: Props) {
  const { latest, isLoading } = useStockFinancials(symbol);
  const { research } = useResearch(symbol);
  const ratios = research?.ratios;

  const longTermAssets = latest && latest.currentAssets != null ? latest.totalAssets - latest.currentAssets : null;
  const longTermLiabilities = latest && latest.currentLiabilities != null ? latest.totalLiabilities - latest.currentLiabilities : null;

  const checks = [
    { label: "Short-term assets exceed short-term liabilities", status: latest?.currentAssets != null && latest?.currentLiabilities != null ? (latest.currentAssets > latest.currentLiabilities ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Long-term assets exceed long-term liabilities", status: longTermAssets != null && longTermLiabilities != null ? (longTermAssets > longTermLiabilities ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Debt is well covered by operating cash flow", status: latest?.totalDebt != null && latest?.operatingCashFlow != null ? (latest.totalDebt === 0 || latest.operatingCashFlow / latest.totalDebt > 0.2 ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Interest well covered by earnings", status: ratios?.interestCoverage != null ? (ratios.interestCoverage > 3 ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Debt to equity is manageable", status: ratios?.debtToEquity != null ? (ratios.debtToEquity < 100 ? "pass" as const : "fail" as const) : "unknown" as const },
    { label: "Has more cash than debt", status: latest?.cash != null && latest?.totalDebt != null ? (latest.cash >= latest.totalDebt ? "pass" as const : "fail" as const) : "unknown" as const },
  ];
  const passed = checks.filter((c) => c.status === "pass").length;

  return (
    <ReportSection number={4} title="Balance Sheet Health">
      <CriteriaChecklist
        checks={checks}
        narrative={!latest ? `No balance sheet on file for ${symbol} yet.` : `${symbol} has total shareholder equity of ${currency}${fmtB(latest.totalEquity)} and total debt of ${currency}${fmtB(latest.totalDebt)}, giving a debt-to-equity ratio of ${ratios?.debtToEquity != null ? `${ratios.debtToEquity.toFixed(0)}%` : "n/a"}. ${passed}/${checks.length} real checks pass.`}
      />

      <KeyInfoUpdates
        rows={[
          { label: "Debt to equity ratio", value: ratios?.debtToEquity != null ? `${ratios.debtToEquity.toFixed(0)}%` : "n/a", highlight: true },
          { label: "Debt", value: latest ? `${currency}${fmtB(latest.totalDebt)}` : "n/a", highlight: true },
          { label: "Interest coverage ratio", value: ratios?.interestCoverage != null ? `${ratios.interestCoverage.toFixed(1)}x` : "n/a" },
          { label: "Cash", value: latest ? `${currency}${fmtB(latest.cash)}` : "n/a" },
          { label: "Equity", value: latest ? `${currency}${fmtB(latest.totalEquity)}` : "n/a" },
          { label: "Total liabilities", value: latest ? `${currency}${fmtB(latest.totalLiabilities)}` : "n/a" },
          { label: "Total assets", value: latest ? `${currency}${fmtB(latest.totalAssets)}` : "n/a" },
        ]}
        updates={[]}
        updatesTitle="Recent financial health updates"
      />

      <SubWidget number="4.1" title="Financial Position Analysis" description="Short-term vs long-term assets and liabilities, most recent period on file.">
        {isLoading ? <p className="text-xs text-muted-foreground py-6">Loading…</p> : !latest ? (
          <p className="text-xs text-muted-foreground py-6">No balance sheet on file yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Short Term</p>
              <Bar label="Assets" value={latest.currentAssets} max={Math.max(latest.currentAssets ?? 0, latest.currentLiabilities ?? 0)} color="hsl(217 91% 60%)" currency={currency} />
              <Bar label="Liabilities" value={latest.currentLiabilities} max={Math.max(latest.currentAssets ?? 0, latest.currentLiabilities ?? 0)} color="hsl(160 84% 58%)" currency={currency} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Long Term</p>
              <Bar label="Assets" value={longTermAssets} max={Math.max(longTermAssets ?? 0, longTermLiabilities ?? 0)} color="hsl(217 91% 60%)" currency={currency} />
              <Bar label="Liabilities" value={longTermLiabilities} max={Math.max(longTermAssets ?? 0, longTermLiabilities ?? 0)} color="hsl(160 84% 58%)" currency={currency} />
            </div>
          </div>
        )}
      </SubWidget>

      <SubWidget number="4.2" title="Debt to Equity History and Analysis" description="Continua doesn't have a multi-year debt/equity time series yet — shown as a current snapshot instead.">
        {!latest ? <p className="text-xs text-muted-foreground py-4">No data on file yet.</p> : (
          <div className="flex gap-6">
            <div><p className="text-[10px] text-muted-foreground">Debt</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.totalDebt)}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Equity</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.totalEquity)}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Cash</p><p className="text-sm font-bold tabular">{currency}{fmtB(latest.cash)}</p></div>
          </div>
        )}
      </SubWidget>
    </ReportSection>
  );
}

function Bar({ label, value, max, color, currency }: { label: string; value: number | null | undefined; max: number; color: string; currency: string }) {
  const pct = value != null && max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-0.5"><span>{label}</span><span className="font-semibold tabular">{value != null ? `${currency}${(value / 1e9).toFixed(2)}B` : "—"}</span></div>
      <div className="h-3 rounded bg-muted overflow-hidden"><div className="h-full rounded" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}