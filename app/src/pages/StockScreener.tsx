import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Filter, TrendingUp, TrendingDown, ChevronRight, RotateCcw, Sparkles, Search, ArrowUpDown, SlidersHorizontal, BarChart3, LineChart } from "lucide-react";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOCK_META, getPrice, getDayChange, DIV_YIELD } from "@/lib/stockPrices";

interface ScreenerFilters {
  sector: string;
  minChange: number;
  maxChange: number;
  minPrice: number;
  maxPrice: number;
  minPE: number;
  maxPE: number;
  minVolume: string;
  marketCapRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const sectors = ["All Sectors", ...Array.from(new Set(Object.values(STOCK_META).map(m => m.sector))).sort()];

// Supplementary screener-only stats (volume, market cap, P/E, beta, RSI) — these aren't
// tracked anywhere else in the app, so they're kept here as authored data. Price, day
// change, sector and dividend yield all come from the shared source below, so this
// screener can never show a different price than the rest of the app for the same stock.
const screenerMeta: Record<string, { volume: string; marketCap: string; pe: number; beta: number; rsi: number }> = {
  SAFCOM: { volume: "12.5M", marketCap: "1.2T", pe: 14.2, beta: 0.85, rsi: 62 },
  EQTY: { volume: "8.2M", marketCap: "285B", pe: 8.5, beta: 1.12, rsi: 58 },
  SCBK: { volume: "1.5M", marketCap: "125B", pe: 11.2, beta: 0.78, rsi: 55 },
  KCB: { volume: "6.8M", marketCap: "145B", pe: 7.8, beta: 1.05, rsi: 48 },
  COOP: { volume: "4.2M", marketCap: "89B", pe: 9.1, beta: 0.92, rsi: 42 },
  EABL: { volume: "850K", marketCap: "112B", pe: 18.5, beta: 0.68, rsi: 65 },
  BAMB: { volume: "320K", marketCap: "32B", pe: 12.3, beta: 0.55, rsi: 38 },
  DTK: { volume: "180K", marketCap: "32B", pe: 10.4, beta: 0.82, rsi: 51 },
  ABSA: { volume: "5.5M", marketCap: "75B", pe: 7.2, beta: 1.08, rsi: 56 },
  NCBA: { volume: "2.1M", marketCap: "68B", pe: 8.9, beta: 0.95, rsi: 52 },
  BRIT: { volume: "1.8M", marketCap: "17B", pe: 15.6, beta: 1.25, rsi: 44 },
  KPLC: { volume: "15.2M", marketCap: "3.8B", pe: 6.5, beta: 1.35, rsi: 71 },
  TOTL: { volume: "280K", marketCap: "4.5B", pe: 13.2, beta: 0.65, rsi: 54 },
  JUB: { volume: "45K", marketCap: "17B", pe: 11.8, beta: 0.88, rsi: 46 },
  BAT: { volume: "45K", marketCap: "34.5B", pe: 16.0, beta: 0.6, rsi: 57 },
  SBIC: { volume: "320K", marketCap: "52B", pe: 9.5, beta: 0.9, rsi: 59 },
  ARM: { volume: "410K", marketCap: "2.8B", pe: 5.4, beta: 1.4, rsi: 61 },
  NBK: { volume: "190K", marketCap: "6.3B", pe: 6.1, beta: 1.1, rsi: 45 },
  KEGN: { volume: "3.1M", marketCap: "22.6B", pe: 5.9, beta: 1.15, rsi: 63 },
  UMEME: { volume: "260K", marketCap: "12.4B", pe: 8.0, beta: 0.7, rsi: 47 },
  CIC: { volume: "1.2M", marketCap: "5.6B", pe: 7.5, beta: 1.05, rsi: 43 },
  KENO: { volume: "540K", marketCap: "18.4B", pe: 9.8, beta: 0.75, rsi: 60 },
  WTK: { volume: "35K", marketCap: "4.2B", pe: 12.0, beta: 0.5, rsi: 49 },
  KAKZ: { volume: "28K", marketCap: "5.5B", pe: 10.5, beta: 0.55, rsi: 66 },
  SASN: { volume: "95K", marketCap: "4.0B", pe: 9.2, beta: 0.6, rsi: 64 },
  EGAD: { volume: "12K", marketCap: "0.9B", pe: 14.5, beta: 0.65, rsi: 41 },
  TCL: { volume: "610K", marketCap: "0.5B", pe: 4.2, beta: 1.6, rsi: 69 },
  SAMR: { volume: "88K", marketCap: "0.8B", pe: 6.8, beta: 1.3, rsi: 39 },
  NSE: { volume: "150K", marketCap: "2.2B", pe: 11.0, beta: 0.8, rsi: 53 },
  CARBACID: { volume: "40K", marketCap: "3.0B", pe: 8.8, beta: 0.5, rsi: 50 },
};

const allStocks = Object.keys(STOCK_META)
  .filter(symbol => symbol !== "SCOM")
  .map(symbol => {
    const { pct } = getDayChange(symbol);
    const meta = screenerMeta[symbol] ?? { volume: "—", marketCap: "—", pe: 0, beta: 1, rsi: 50 };
    return {
      symbol,
      name: STOCK_META[symbol].name,
      sector: STOCK_META[symbol].sector,
      price: getPrice(symbol),
      change: +pct.toFixed(2),
      dividendYield: DIV_YIELD[symbol] ?? 0,
      ...meta,
    };
  });

const presetFilters = [
  { name: "🔥 Top Gainers", icon: TrendingUp, filters: { sector: "All Sectors", minChange: 1, maxChange: 100, sortBy: "change", sortOrder: "desc" as const } },
  { name: "📉 Top Losers", icon: TrendingDown, filters: { sector: "All Sectors", minChange: -100, maxChange: -0.1, sortBy: "change", sortOrder: "asc" as const } },
  { name: "💰 High Dividend", icon: BarChart3, filters: { sector: "All Sectors", minChange: -100, maxChange: 100, sortBy: "dividendYield", sortOrder: "desc" as const } },
  { name: "📊 High Volume", icon: LineChart, filters: { sector: "All Sectors", minChange: -100, maxChange: 100, sortBy: "volume", sortOrder: "desc" as const } },
  { name: "🏦 Banking", icon: Filter, filters: { sector: "Banking", minChange: -100, maxChange: 100, sortBy: "marketCap", sortOrder: "desc" as const } },
  { name: "⚡ Oversold (RSI<40)", icon: Sparkles, filters: { sector: "All Sectors", minChange: -100, maxChange: 100, sortBy: "rsi", sortOrder: "asc" as const } },
];

export default function StockScreenerPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>({
    sector: "All Sectors",
    minChange: -10,
    maxChange: 10,
    minPrice: 0,
    maxPrice: 500,
    minPE: 0,
    maxPE: 50,
    minVolume: "0",
    marketCapRange: "all",
    sortBy: "marketCap",
    sortOrder: "desc",
  });

  const applyPreset = (preset: typeof presetFilters[0]) => {
    setFilters(prev => ({ ...prev, ...preset.filters }));
  };

  const resetFilters = () => {
    setFilters({
      sector: "All Sectors",
      minChange: -10,
      maxChange: 10,
      minPrice: 0,
      maxPrice: 500,
      minPE: 0,
      maxPE: 50,
      minVolume: "0",
      marketCapRange: "all",
      sortBy: "marketCap",
      sortOrder: "desc",
    });
    setSearchQuery("");
  };

  const filteredStocks = allStocks
    .filter(stock => {
      if (searchQuery && !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !stock.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.sector !== "All Sectors" && stock.sector !== filters.sector) return false;
      if (stock.change < filters.minChange || stock.change > filters.maxChange) return false;
      if (stock.price < filters.minPrice || stock.price > filters.maxPrice) return false;
      if (stock.pe < filters.minPE || stock.pe > filters.maxPE) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: number, bVal: number;
      switch (filters.sortBy) {
        case 'change': aVal = a.change; bVal = b.change; break;
        case 'price': aVal = a.price; bVal = b.price; break;
        case 'volume': aVal = parseFloat(a.volume); bVal = parseFloat(b.volume); break;
        case 'pe': aVal = a.pe; bVal = b.pe; break;
        case 'dividendYield': aVal = a.dividendYield; bVal = b.dividendYield; break;
        case 'rsi': aVal = a.rsi; bVal = b.rsi; break;
        default: aVal = parseFloat(a.marketCap); bVal = parseFloat(b.marketCap);
      }
      return filters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Stock Screener</h1>
              <p className="text-xs text-muted-foreground">Discover your next investment</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/20"
          />
        </div>

        {/* Quick Presets */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            {presetFilters.map((preset) => (
              <Badge
                key={preset.name}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors whitespace-nowrap text-xs py-1.5 px-3 tap-scale"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters — flat canvas */}
        <div className="pt-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <p className="section-eyebrow flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Filters
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground tabular">{filteredStocks.length} results</span>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[11px] h-7 px-2" aria-label="Reset filters">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Sector</label>
                <Select
                  value={filters.sector}
                  onValueChange={(val) => setFilters(prev => ({ ...prev, sector: val }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector} className="text-xs">
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(val) => setFilters(prev => ({ ...prev, sortBy: val }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketCap" className="text-xs">Market Cap</SelectItem>
                    <SelectItem value="change" className="text-xs">% Change</SelectItem>
                    <SelectItem value="price" className="text-xs">Price</SelectItem>
                    <SelectItem value="volume" className="text-xs">Volume</SelectItem>
                    <SelectItem value="pe" className="text-xs">P/E Ratio</SelectItem>
                    <SelectItem value="dividendYield" className="text-xs">Dividend Yield</SelectItem>
                    <SelectItem value="rsi" className="text-xs">RSI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Price Change: {filters.minChange}% to {filters.maxChange}%
              </label>
              <Slider
                value={[filters.minChange, filters.maxChange]}
                min={-10}
                max={10}
                step={0.5}
                onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minChange: min, maxChange: max }))}
              />
            </div>

            {showAdvanced && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Price Range: KES {filters.minPrice} to KES {filters.maxPrice}
                  </label>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    min={0}
                    max={500}
                    step={5}
                    onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    P/E Ratio: {filters.minPE} to {filters.maxPE}
                  </label>
                  <Slider
                    value={[filters.minPE, filters.maxPE]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPE: min, maxPE: max }))}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                className="text-xs"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results — hairline rows, no cards */}
        <div className="-mx-4 border-t border-border/60">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              className="w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/25 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{stock.symbol}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{stock.sector}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-1.5">{stock.name}</div>
                  <div className="flex gap-3 flex-wrap text-[10px] text-muted-foreground tabular">
                    <span>Vol {stock.volume}</span>
                    <span>P/E {stock.pe}</span>
                    <span>Div {stock.dividendYield}%</span>
                    <span>RSI {stock.rsi}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SparklineChart isPositive={stock.change >= 0} width={50} height={22} />
                  <div className="text-right min-w-[75px]">
                    <div className="font-semibold text-sm tabular">KES {stock.price.toFixed(2)}</div>
                    <div className={`text-xs flex items-center justify-end gap-0.5 tabular ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="py-14 text-center">
            <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium mb-1">No stocks found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}