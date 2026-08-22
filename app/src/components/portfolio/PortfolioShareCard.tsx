import { forwardRef, useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Reads the *actual computed* HSL triplets for a handful of CSS custom
 * properties off :root right now, instead of leaving `hsl(var(--x))`
 * references in the card's inline style.
 *
 * Why: html-to-image (used by SharePortfolioDialog to turn this card into a
 * PNG) clones this node and serializes it into a standalone SVG
 * <foreignObject> for rasterization. That clone doesn't reliably carry the
 * live cascade needed to resolve `var(--primary)` etc., so any gradient stop
 * built from an unresolved variable parses as an invalid color — which
 * canvas rendering paints as solid black. That's the dark diagonal "shadow"
 * across the top of downloaded/shared images in light mode, and it's also
 * why the card doesn't read the AMOLED palette correctly in an export: the
 * fallback color has nothing to do with the active theme.
 *
 * Baking in literal `hsl(H S% L% / A)` strings (no var()) makes the card
 * theme-correct AND safe to rasterize, on-screen and in the exported image.
 */
function useResolvedThemeColors() {
  const [colors, setColors] = useState({ primary: "252 70% 52%", card: "0 0% 100%", isAmoled: false });

  useEffect(() => {
    const read = () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      setColors({
        primary: styles.getPropertyValue("--primary").trim() || "252 70% 52%",
        card: styles.getPropertyValue("--card").trim() || "0 0% 100%",
        isAmoled: root.classList.contains("amoled"),
      });
    };
    read();
    // Theme can change (light/dark/amoled toggle) without this component
    // remounting, since it can stay open across a theme switch.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

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
    const { primary, card, isAmoled } = useResolvedThemeColors();
    // AMOLED keeps every surface flat true-black-or-near-black (see index.css
    // "AMOLED consistency") — no lifted gradients — so the card matches the
    // rest of the app instead of standing out with a violet-tinted sheen.
    const cardBackground = isAmoled ? `hsl(${card})` : `linear-gradient(165deg, hsl(${primary} / 0.08), hsl(${card}) 55%)`;

    return (
      <div
        ref={ref}
        className="w-[360px] rounded-3xl overflow-hidden border border-border"
        style={{ background: cardBackground }}
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