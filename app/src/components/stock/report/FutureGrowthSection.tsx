import { ReportSection } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { KeyInfoUpdates } from "./KeyInfoUpdates";
import { useStockFinancials } from "@/hooks/useStockFinancials";

interface Props { symbol: string }

function pctChange(latest: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((latest - prior) / Math.abs(prior)) * 100;
}

/** Continua has no analyst forward-estimates feed, so — same as Simply
 *  Wall St shows for thinly-covered NSE stocks — this section is
 *  honestly mostly "n/a" rather than guessed. The one real thing shown
 *  is trailing (already-reported) growth, clearly labeled as such. */
export function FutureGrowthSection({ symbol }: Props) {
  const { history, isLoading } = useStockFinancials(symbol);
  const [latest, prior] = [...history].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const earningsGrowth = latest && prior ? pctChange(latest.netIncome, prior.netIncome) : null;
  const epsGrowth = latest && prior ? pctChange(latest.eps, prior.eps) : null;
  const revenueGrowth = latest && prior ? pctChange(latest.revenue, prior.revenue) : null;

  return (
    <ReportSection number={2} title="Future Growth">
      <CriteriaChecklist
        checks={[{ label: "Analyst forecast coverage", status: "unknown" }]}
        narrative={`Continua doesn't currently have sufficient analyst coverage to forecast growth and revenue for ${symbol}. The trailing figures below are real, already-reported numbers, not a forecast.`}
      />

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-4">Loading…</p>
      ) : (
        <KeyInfoUpdates
          rows={[
            { label: "Trailing earnings growth rate", value: earningsGrowth != null ? `${earningsGrowth >= 0 ? "+" : ""}${earningsGrowth.toFixed(1)}%` : "n/a", highlight: true },
            { label: "Trailing EPS growth rate", value: epsGrowth != null ? `${epsGrowth >= 0 ? "+" : ""}${epsGrowth.toFixed(1)}%` : "n/a", highlight: true },
            { label: "Trailing revenue growth rate", value: revenueGrowth != null ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%` : "n/a" },
            { label: "Forecast return on equity", value: "n/a" },
            { label: "Analyst coverage", value: "None" },
            { label: "Last updated", value: "n/a" },
          ]}
          updates={[]}
          updatesTitle="Recent future growth updates"
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        In this section Simply Wall St presents revenue and earnings growth projections based on consensus
        analyst estimates. Continua doesn't ingest an analyst-estimates feed, so this section honestly shows
        real trailing growth instead of an invented forecast.
      </p>
    </ReportSection>
  );
}