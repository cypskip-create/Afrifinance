import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockHeatmap } from "@/components/home/StockHeatmap";

const ALL_STOCKS = [
  { symbol: 'SAFCOM', name: 'Safaricom', change: 2.4, marketCap: 1200, sector: 'Telecom' },
  { symbol: 'EQTY', name: 'Equity Group', change: 3.8, marketCap: 950, sector: 'Banking' },
  { symbol: 'KCB', name: 'KCB Group', change: -0.8, marketCap: 520, sector: 'Banking' },
  { symbol: 'SCBK', name: 'StanChart', change: 1.1, marketCap: 680, sector: 'Banking' },
  { symbol: 'COOP', name: 'Co-op Bank', change: -1.5, marketCap: 380, sector: 'Banking' },
  { symbol: 'ABSA', name: 'ABSA Kenya', change: 1.9, marketCap: 350, sector: 'Banking' },
  { symbol: 'NCBA', name: 'NCBA Group', change: 0.7, marketCap: 310, sector: 'Banking' },
  { symbol: 'DTB', name: 'DTB Kenya', change: 0.5, marketCap: 240, sector: 'Banking' },
  { symbol: 'EABL', name: 'EABL', change: 2.1, marketCap: 420, sector: 'Consumer' },
  { symbol: 'BAT', name: 'BAT Kenya', change: 0.3, marketCap: 280, sector: 'Consumer' },
  { symbol: 'BAMB', name: 'Bamburi', change: -2.8, marketCap: 290, sector: 'Industrial' },
  { symbol: 'ARM', name: 'ARM Cement', change: 3.3, marketCap: 90, sector: 'Industrial' },
  { symbol: 'KPLC', name: 'Kenya Power', change: 4.2, marketCap: 180, sector: 'Energy' },
  { symbol: 'KEGN', name: 'KenGen', change: 2.1, marketCap: 220, sector: 'Energy' },
  { symbol: 'TOTL', name: 'TotalEnergies', change: -4.1, marketCap: 130, sector: 'Energy' },
  { symbol: 'BRIT', name: 'Britam', change: -1.2, marketCap: 150, sector: 'Insurance' },
  { symbol: 'JUB', name: 'Jubilee', change: 0.5, marketCap: 170, sector: 'Insurance' },
  { symbol: 'CIC', name: 'CIC Insurance', change: -2.3, marketCap: 56, sector: 'Insurance' },
  { symbol: 'NMG', name: 'Nation Media', change: -0.3, marketCap: 180, sector: 'Media' },
  { symbol: 'SASN', name: 'Sasini', change: 2.8, marketCap: 40, sector: 'Agriculture' },
  { symbol: 'KAKZ', name: 'Kakuzi', change: 4.5, marketCap: 55, sector: 'Agriculture' },
  { symbol: 'WTK', name: 'Williamson Tea', change: -0.3, marketCap: 42, sector: 'Agriculture' },
];

const SECTORS = ["All", "Banking", "Telecom", "Consumer", "Energy", "Insurance", "Industrial", "Media", "Agriculture"];
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
