import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockHeatmap } from "@/components/home/StockHeatmap";
import { CANONICAL_SYMBOLS, STOCK_META, getDayChange, getStockFundamentals, parseMagnitude } from "@/lib/stockPrices";

// Derived from the shared price/fundamentals source — same list AllStocks, the Screener,
// and Compare use — so this heatmap can't show a stock (or a change%) that disagrees with
// the rest of the app, and can't include a ticker (like the old placeholder "NMG") that
// isn't actually part of the app's real NSE universe.
const ALL_STOCKS = CANONICAL_SYMBOLS.map(symbol => {
  const { pct } = getDayChange(symbol);
  const f = getStockFundamentals(symbol);
  return {
    symbol,
    name: STOCK_META[symbol].name,
    change: +pct.toFixed(1),
    marketCap: parseMagnitude(f.marketCap) / 1e9, // billions, for relative sizing only
    sector: STOCK_META[symbol].sector,
  };
});

const SECTORS = ["All", ...Array.from(new Set(ALL_STOCKS.map(s => s.sector))).sort()];
const RANGES = ["1D", "1W", "1M", "YTD"] as const;

export default function SectorHeatmap() {
  const navigate = useNavigate();
  const [sector, setSector] = useState<string>("All");
  const [range, setRange] = useState<typeof RANGES[number]>("1D");

  const filtered = useMemo(
    () => sector === "All" ? ALL_STOCKS : ALL_STOCKS.filter(s => s.sector === sector),
    [sector]
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
  }, []);

  return (
    <div className="page-canvas min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9" data-small-target>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold">Sector Heatmap</h1>
            <p className="text-[11px] text-muted-foreground">NSE · size = market cap · colour = performance</p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* Range pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {RANGES.map(r => (
            <button
              key={r}
              data-small-target
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-colors ${range === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground border border-border/60'}`}
            >{r}</button>
          ))}
        </div>

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
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${sector === s ? 'bg-foreground text-background' : 'border border-border/60 text-muted-foreground hover:text-foreground'}`}
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