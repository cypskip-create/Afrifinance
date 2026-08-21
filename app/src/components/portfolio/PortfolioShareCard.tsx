import { forwardRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface ShareableHolding {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  avgCost: number;
  dayChangePct: number;
  gainPct: number;
}

export interface PortfolioShareCardProps {
  displayName: string;
  totalValue: number;
  totalGain: number;
  gainPercent: number;
  todayGain: number;
  todayPercent: number;
  holdings: ShareableHolding[];
  hideAmounts: boolean;
  hideGains: boolean;
  topHoldingsOnly: boolean;
  showDayChange: boolean;
}

const kes = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Pure presentational — no data fetching. forwardRef so the share dialog can
 * point html-to-image at this exact DOM node for the download/native-share
 * actions, while the same component doubles as the live preview.
 */
export const PortfolioShareCard = forwardRef<HTMLDivElement, PortfolioShareCardProps>(
  ({ displayName, totalValue, totalGain, gainPercent, todayGain, todayPercent, holdings, hideAmounts, hideGains, topHoldingsOnly, showDayChange }, ref) => {
    const shown = topHoldingsOnly ? holdings.slice(0, 5) : holdings;
    const primaryGain = showDayChange ? todayGain : totalGain;
    const primaryPct = showDayChange ? todayPercent : gainPercent;

    return (
      <div
        ref={ref}
        className="w-[360px] rounded-3xl overflow-hidden border border-border"
        style={{ background: "linear-gradient(165deg, hsl(var(--primary)/0.08), hsl(var(--card)) 55%)" }}
      >
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[12px] font-bold">C</div>
              <span className="text-[13px] font-bold tracking-tight">Continua</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">NSE Portfolio</span>
          </div>

          <p className="text-[11px] text-muted-foreground truncate">{displayName}'s portfolio</p>
          <p className="text-[26px] font-bold tabular leading-tight mt-0.5">
            {hideAmounts ? "KES ••••••" : `KES ${kes(totalValue)}`}
          </p>

          {!hideGains && (
            <div className={`inline-flex items-center gap-1 mt-1.5 text-[13px] font-semibold ${primaryGain >= 0 ? "text-bull" : "text-bear"}`}>
              {primaryGain >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {hideAmounts ? "" : `${primaryGain >= 0 ? "+" : "−"}KES ${kes(Math.abs(primaryGain))} `}
              ({primaryGain >= 0 ? "+" : ""}{primaryPct.toFixed(2)}%) {showDayChange ? "today" : "all-time"}
            </div>
          )}
        </div>

        {shown.length > 0 && (
          <div className="px-5 pb-5 space-y-2.5">
            {shown.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold shrink-0">
                    {h.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold truncate">{h.symbol}</p>
                    {!hideAmounts && <p className="text-[10px] text-muted-foreground">{h.shares} sh</p>}
                  </div>
                </div>
                {!hideGains && (
                  <span className={`text-[12px] font-semibold tabular ${(showDayChange ? h.dayChangePct : h.gainPct) >= 0 ? "text-bull" : "text-bear"}`}>
                    {(showDayChange ? h.dayChangePct : h.gainPct) >= 0 ? "+" : ""}
                    {(showDayChange ? h.dayChangePct : h.gainPct).toFixed(2)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-border/60 bg-muted/20">
          <p className="text-[9.5px] text-center text-muted-foreground">Track NSE stocks on Continua</p>
        </div>
      </div>
    );
  }
);
PortfolioShareCard.displayName = "PortfolioShareCard";