import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Trash2 } from "lucide-react";
import { getPrice, getDayChange, getDivYield } from "@/lib/stockPrices";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { cn } from "@/lib/utils";

export interface HoldingInput {
  id?: string;
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  sector?: string | null;
}

interface Props {
  holdings: HoldingInput[];
  /** Hide KES amounts (percentages stay visible). */
  showValues?: boolean;
  /** Hide profit/loss entirely (public-profile privacy option). */
  showGains?: boolean;
  onRemove?: (id: string) => void;
}

const kes = (n: number, dp = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

/**
 * Institutional holdings table — one dense row per position, expandable into a
 * full cost-basis / P&L / income breakdown. Flat on the page canvas, hairline
 * separated, tabular numerics throughout.
 */
export function HoldingsList({ holdings, showValues = true, showGains = true, onRemove }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Live AfriFinance Data Layer quotes — the SAME quotes Watchlist, Markets
  // and the Stock Page read, so a position's value here can never disagree
  // with what those surfaces show for the same symbol (see docs/api/API.md
  // §21 "single source of truth"). Falls back to the static reference
  // price per-symbol if the Data Layer doesn't cover it yet.
  const symbols = useMemo(() => holdings.map(h => h.symbol), [holdings]);
  const { quotes } = useLiveQuotes(symbols);

  const rows = holdings.map((h) => {
    const quote = quotes[h.symbol.toUpperCase()];
    const price = quote?.lastPrice ?? getPrice(h.symbol, h.avg_cost);
    const value = price * h.shares;
    const cost = h.avg_cost * h.shares;
    const gain = value - cost;
    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
    const day = quote ? { abs: quote.change, pct: quote.changePercent } : getDayChange(h.symbol);
    const dayValue = day.abs * h.shares;
    const divYield = getDivYield(h.symbol);
    const income = (divYield / 100) * value;
    return { ...h, price, value, cost, gain, gainPct, day, dayValue, divYield, income, isLive: !!quote };
  });

  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 pb-2 hairline text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <span className="col-span-5">Position</span>
        <span className="col-span-3 text-right">Market value</span>
        <span className="col-span-4 text-right">Total return</span>
      </div>

      <div>
        {rows.map((r) => {
          const key = r.id || r.symbol;
          const isOpen = expanded === key;
          const weight = total > 0 ? (r.value / total) * 100 : 0;
          return (
            <div key={key} className="border-b border-border/50 last:border-0">
              <button
                data-small-target
                onClick={() => setExpanded(isOpen ? null : key)}
                className="w-full grid grid-cols-12 gap-2 items-center py-3 text-left active:bg-muted/20 transition-colors"
              >
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {r.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[13px] font-semibold truncate">{r.symbol}</p>
                      <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {r.shares} sh · avg {kes(r.avg_cost)}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 text-right">
                  <p className="text-[13px] font-semibold tabular">{showValues ? kes(r.value, 0) : "••••"}</p>
                  <p className={cn("text-[10px] tabular", r.day.pct >= 0 ? "text-bull" : "text-bear")}>
                    {r.day.pct >= 0 ? "+" : ""}{r.day.pct.toFixed(2)}% today
                  </p>
                </div>

                <div className="col-span-4 text-right">
                  {showGains ? (
                    <>
                      <p className={cn("text-[13px] font-semibold tabular", r.gain >= 0 ? "text-bull" : "text-bear")}>
                        {r.gain >= 0 ? "+" : ""}{r.gainPct.toFixed(2)}%
                      </p>
                      <p className={cn("text-[10px] tabular", r.gain >= 0 ? "text-bull" : "text-bear")}>
                        {showValues ? `${r.gain >= 0 ? "+" : "−"}KES ${kes(Math.abs(r.gain), 0)}` : "••••"}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Hidden</p>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="pb-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-y-3 gap-x-2 hairline-t pt-3">
                    <Metric label="Last price" value={kes(r.price)} />
                    <Metric label="Avg price" value={kes(r.avg_cost)} />
                    <Metric label="Shares" value={String(r.shares)} />
                    <Metric label="Cost basis" value={showValues ? kes(r.cost, 0) : "••••"} />
                    <Metric
                      label="Day P/L"
                      value={showValues ? `${r.dayValue >= 0 ? "+" : "−"}${kes(Math.abs(r.dayValue), 0)}` : "••••"}
                      tone={r.dayValue >= 0 ? "bull" : "bear"}
                    />
                    <Metric
                      label="Unrealised P/L"
                      value={showGains ? (showValues ? `${r.gain >= 0 ? "+" : "−"}${kes(Math.abs(r.gain), 0)}` : "••••") : "—"}
                      tone={r.gain >= 0 ? "bull" : "bear"}
                    />
                    <Metric label="Portfolio weight" value={`${weight.toFixed(1)}%`} />
                    <Metric label="Div. yield" value={r.divYield > 0 ? `${r.divYield.toFixed(1)}%` : "—"} />
                    <Metric label="Est. income / yr" value={r.divYield > 0 && showValues ? kes(r.income, 0) : "—"} />
                  </div>

                  <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-foreground/70" style={{ width: `${Math.min(100, weight)}%` }} />
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <button
                      data-small-target
                      className="text-[11px] font-semibold text-primary"
                      onClick={() => navigate(`/stock/${r.symbol}`)}
                    >
                      Open {r.symbol} research
                    </button>
                    {onRemove && r.id && (
                      <button
                        data-small-target
                        className="text-[11px] font-semibold text-destructive inline-flex items-center gap-1"
                        onClick={() => onRemove(r.id!)}
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className={cn("text-[12px] font-semibold tabular mt-0.5", tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>
        {value}
      </p>
    </div>
  );
}