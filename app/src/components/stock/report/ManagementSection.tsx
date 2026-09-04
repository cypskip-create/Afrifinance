import { ReportSection } from "./ReportSection";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { KeyInfoUpdates } from "./KeyInfoUpdates";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

interface Props { symbol: string }

/** Continua's data layer doesn't ingest executive biography, tenure,
 *  compensation, or board-composition data at all — there's no source
 *  for it anywhere in the pipeline (unlike valuation, financials, and
 *  dividends, which are all real elsewhere in this report). The one
 *  real field available is the CEO's name from the company profile;
 *  everything else here is honestly "no data" rather than invented. */
export function ManagementSection({ symbol }: Props) {
  const { profile, isLoading } = useCompanyProfile(symbol);
  const ceo = profile?.company.ceo;

  return (
    <ReportSection number={6} title="Management">
      <CriteriaChecklist
        checks={[
          { label: "CEO identified", status: ceo ? "pass" : "unknown" },
          { label: "CEO tenure on file", status: "unknown" },
          { label: "CEO compensation on file", status: "unknown" },
          { label: "Board composition on file", status: "unknown" },
        ]}
        narrative="Continua doesn't ingest executive biography, tenure, compensation, or board-composition data yet — this section is shown so the tool is visibly present rather than silently missing, not filled with invented figures."
      />

      <KeyInfoUpdates
        rows={[
          { label: "CEO", value: isLoading ? "…" : ceo || "n/a", highlight: true },
          { label: "CEO tenure", value: "n/a" },
          { label: "Total compensation", value: "n/a" },
          { label: "Board average tenure", value: "n/a" },
        ]}
        updates={[]}
        updatesTitle="Recent management updates"
      />
    </ReportSection>
  );
}