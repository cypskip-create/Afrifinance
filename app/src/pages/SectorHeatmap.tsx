import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockHeatmap } from "@/components/home/StockHeatmap";
import { CANONICAL_SYMBOLS, STOCK_META, getDayChange, getStockFundamentals, parseMagnitude, getRangeChangePct, getMoneyFlowM, type ChangeRange } from "@/lib/stockPrices";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { Waves, BarChart3 } from "lucide-react";

// Derived from the shared price/fundamentals source — same list AllStocks, the Screener,
// and Compare use — so this heatmap can't show a stock (or a change%) that disagrees with
// the rest of the app, and can't include a ticker (like the old placeholder "NMG") that
// isn't actually part of the app's real NSE universe. Change% is overlaid with live
// Continua Data Layer quotes inside the component below wherever the Data Layer covers
// a symbol; market cap (used only for relative bubble sizing) stays on the static table.
function buildStaticStocks(range: ChangeRange, flowMode: boolean) {
  return CANONICAL_SYMBOLS.map(symbol => {
    const change = getRangeChangePct(symbol, range);
    const f = getStockFundamentals(symbol);
    return {
      symbol,
      name: STOCK_META[symbol].name,
      change,
      // Performance mode sizes tiles by market cap; Capital Flow mode sizes them by
      // signed money flow (price × volume) so the tiles show where money is actually
      // moving rather than just which stocks are biggest.
      marketCap: flowMode ? Math.abs(getMoneyFlowM(symbol, range)) : parseMagnitude(f.marketCap) / 1e9,
      sector: STOCK_META[symbol].sector,
    };
  });
}

const SECTORS = ["All", ...Array.from(new Set(CANONICAL_SYMBOLS.map(s => STOCK_META[s].sector))).sort()];
const RANGES = ["1D", "1W", "1M", "YTD"] as const;

export default function SectorHeatmap() {
  const navigate = useNavigate();
  const [sector, setSector] = useState<string>("All");
  const [range, setRange] = useState<ChangeRange>("1D");
  const [flowMode, setFlowMode] = useState(false);

  const { quotes } = useLiveQuotes(CANONICAL_SYMBOLS);
  const ALL_STOCKS = useMemo(() => {
    const base = buildStaticStocks(range, flowMode);
    if (range !== "1D") return base;
    // 1D is the one range with a real live feed — overlay it wherever the Data Layer covers a symbol.
    return base.map(s => {
      const q = quotes[s.symbol];
      if (!q) return s;
      const change = +q.changePercent.toFixed(2);
      return { ...s, change, marketCap: flowMode ? Math.abs(getMoneyFlowM(s.symbol, range)) : s.marketCap };
    });
  }, [quotes, range, flowMode]);

  const filtered = useMemo(
    () => sector === "All" ? ALL_STOCKS : ALL_STOCKS.filter(s => s.sector === sector),
    [sector, ALL_STOCKS]
  );

  const sectorRollup = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; cap: number }>();
    ALL_STOCKS.forEach(s => {
      const cur = map.get(s.sector) || { sum: 0, count: 0, cap: 0 };
      map.set(s.sector, { sum: cur.sum + s.change * s.marketCap, count: cur.count + 1, cap: cur.cap + s.marketCap });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, change: v.cap > 0 ? v.sum / v.cap : 0, count: v.count }))
      .sort((a, b) => b.change - a.change);
  }, [ALL_STOCKS]);

  return (
    <div className="page-canvas min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9" data-small-target>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold">Sector Heatmap</h1>
            <p className="text-[11px] text-muted-foreground">
              NSE · size = {flowMode ? "money flow" : "market cap"} · colour = {flowMode ? `${range} flow` : `${range} performance`}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* Performance vs Capital Flow */}
        <div className="flex rounded-full bg-muted/50 p-0.5">
          <button
            data-small-target
            onClick={() => setFlowMode(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${!flowMode ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </button>
          <button
            data-small-target
            onClick={() => setFlowMode(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${flowMode ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            <Waves className="h-3.5 w-3.5" /> Capital Flow
          </button>
        </div>

        {/* Range pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {RANGES.map(r => (
            <button
              key={r}
              data-small-target
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-colors ${range === r ? 'brand-active' : 'text-muted-foreground hover:text-foreground border border-border/60'}`}
            >{r}</button>
          ))}
        </div>

        {flowMode && (
          <p className="text-[11px] text-muted-foreground -mt-3">
            Tile size reflects net capital moving in or out of each stock over {range}, not company size — spot where the money's going, not just who's biggest.
          </p>
        )}

        {/* Sector rollup */}
        <div>
          <p className="section-eyebrow mb-2">Sector Performance</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sectorRollup.map(s => (
              <button
                key={s.name}
                data-small-target
                onClick={() => setSector(s.name)}
                className={`text-left rounded-xl p-3 transition-all ${s.change >= 0 ? 'bg-bull/10 hover:bg-bull/15' : 'bg-bear/10 hover:bg-bear/15'} ${sector === s.name ? 'ring-2 ring-foreground/60' : ''}`}
              >
                <p className="text-xs font-semibold">{s.name}</p>
                <p className={`text-base font-bold tabular ${s.change >= 0 ? 'text-bull' : 'text-bear'} flex items-center gap-1`}>
                  {s.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} stocks</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sector filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {SECTORS.map(s => (
            <button
              key={s}
              data-small-target
              onClick={() => setSector(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${sector === s ? 'brand-active' : 'border border-border/60 text-muted-foreground hover:text-foreground'}`}
            >{s}</button>
          ))}
        </div>

        {/* Heatmap */}
        <div>
          <p className="section-eyebrow mb-2">{sector === "All" ? "Full NSE" : sector} · {filtered.length} stocks</p>
          <StockHeatmap stocks={filtered} />
        </div>
      </div>
    </div>
  );
}