import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, GitCompare, Plus, X, TrendingUp, TrendingDown, Search, BarChart3, PieChart, Activity, DollarSign, Percent, Scale, ChevronRight } from "lucide-react";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: string;
  pe: number;
  eps: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  beta: number;
  high52: number;
  low52: number;
  volume: string;
  sector: string;
}

const stocksDatabase: Stock[] = [
  { symbol: "SAFCOM", name: "Safaricom PLC", price: 12.85, change: 2.4, marketCap: "1.2T", pe: 14.2, eps: 0.91, dividendYield: 4.8, roe: 25.3, debtToEquity: 0.42, beta: 0.85, high52: 14.20, low52: 10.80, volume: "12.5M", sector: "Telecommunications" },
  { symbol: "EQTY", name: "Equity Group Holdings", price: 62.50, change: 3.8, marketCap: "285B", pe: 8.5, eps: 7.35, dividendYield: 4.0, roe: 22.1, debtToEquity: 0.85, beta: 1.12, high52: 68.00, low52: 45.25, volume: "8.2M", sector: "Banking" },
  { symbol: "SCBK", name: "Standard Chartered Bank", price: 185.00, change: 1.1, marketCap: "125B", pe: 11.2, eps: 16.52, dividendYield: 6.7, roe: 18.5, debtToEquity: 0.92, beta: 0.78, high52: 195.00, low52: 165.25, volume: "1.5M", sector: "Banking" },
  { symbol: "KCB", name: "KCB Group PLC", price: 45.30, change: -0.8, marketCap: "145B", pe: 7.8, eps: 5.81, dividendYield: 5.5, roe: 19.8, debtToEquity: 0.78, beta: 1.05, high52: 52.00, low52: 38.50, volume: "6.8M", sector: "Banking" },
  { symbol: "COOP", name: "Co-operative Bank", price: 15.20, change: -1.5, marketCap: "89B", pe: 9.1, eps: 1.67, dividendYield: 6.6, roe: 16.2, debtToEquity: 0.65, beta: 0.92, high52: 17.50, low52: 12.80, volume: "4.2M", sector: "Banking" },
  { symbol: "EABL", name: "East African Breweries", price: 142.00, change: 2.1, marketCap: "112B", pe: 18.5, eps: 7.68, dividendYield: 3.5, roe: 28.5, debtToEquity: 0.55, beta: 0.68, high52: 158.00, low52: 125.00, volume: "850K", sector: "Consumer Goods" },
  { symbol: "BAMB", name: "Bamburi Cement", price: 89.75, change: -2.8, marketCap: "32B", pe: 12.3, eps: 7.30, dividendYield: 2.2, roe: 12.5, debtToEquity: 0.32, beta: 0.55, high52: 105.00, low52: 78.00, volume: "320K", sector: "Manufacturing" },
  { symbol: "ABSA", name: "ABSA Bank Kenya", price: 13.85, change: 1.9, marketCap: "75B", pe: 7.2, eps: 1.92, dividendYield: 7.2, roe: 21.5, debtToEquity: 0.72, beta: 1.08, high52: 15.50, low52: 11.20, volume: "5.5M", sector: "Banking" },
];

const comparisonMetrics = [
  { key: "price", label: "Price", icon: DollarSign, format: (v: number) => `KES ${v.toFixed(2)}` },
  { key: "change", label: "Change %", icon: TrendingUp, format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, colorize: true },
  { key: "marketCap", label: "Market Cap", icon: BarChart3, format: (v: string) => v },
  { key: "pe", label: "P/E Ratio", icon: Scale, format: (v: number) => v.toFixed(1) },
  { key: "eps", label: "EPS", icon: Activity, format: (v: number) => `KES ${v.toFixed(2)}` },
  { key: "dividendYield", label: "Dividend Yield", icon: Percent, format: (v: number) => `${v.toFixed(1)}%` },
  { key: "roe", label: "ROE", icon: PieChart, format: (v: number) => `${v.toFixed(1)}%` },
  { key: "debtToEquity", label: "Debt/Equity", icon: Scale, format: (v: number) => v.toFixed(2) },
  { key: "beta", label: "Beta", icon: Activity, format: (v: number) => v.toFixed(2) },
  { key: "high52", label: "52W High", icon: TrendingUp, format: (v: number) => `KES ${v.toFixed(2)}` },
  { key: "low52", label: "52W Low", icon: TrendingDown, format: (v: number) => `KES ${v.toFixed(2)}` },
  { key: "volume", label: "Volume", icon: BarChart3, format: (v: string) => v },
];

export default function StockCompare() {
  const navigate = useNavigate();
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredStocks = stocksDatabase.filter(
    stock =>
      !selectedStocks.find(s => s.symbol === stock.symbol) &&
      (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addStock = (stock: Stock) => {
    if (selectedStocks.length < 4) {
      setSelectedStocks(prev => [...prev, stock]);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const removeStock = (symbol: string) => {
    setSelectedStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  const getBestValue = (key: string, isHigherBetter: boolean = true) => {
    if (selectedStocks.length < 2) return null;
    const values = selectedStocks.map(s => {
      const val = s[key as keyof Stock];
      return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
    });
    const bestIdx = isHigherBetter
      ? values.indexOf(Math.max(...values))
      : values.indexOf(Math.min(...values));
    return selectedStocks[bestIdx]?.symbol;
  };

  return (
    <div className="page-canvas min-h-screen bg-background pb-20">
      {/* Header — thin, editorial */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-semibold flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                Compare
              </h1>
              <p className="text-[10px] text-muted-foreground">Side-by-side analysis</p>
            </div>
          </div>
          {selectedStocks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedStocks([])} className="text-xs text-muted-foreground">
              Clear
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 pt-6 space-y-8">
        {/* Add stock — canvas, no card */}
        {selectedStocks.length < 4 && (
          <div>
            {showSearch ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
                <div className="border-t border-border/60 max-h-64 overflow-y-auto">
                  {filteredStocks.slice(0, 8).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => addStock(stock)}
                      className="w-full flex items-center justify-between py-2.5 border-b border-border/40 hover:bg-muted/30 -mx-4 px-4 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-bold text-primary">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{stock.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="w-full h-12 rounded-full border border-dashed border-border/70 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Stock to Compare ({selectedStocks.length}/4)
              </button>
            )}
          </div>
        )}

        {/* Selected chips — no card, hairline rail */}
        {selectedStocks.length > 0 && (
          <ScrollArea className="w-full -mx-4">
            <div className="flex gap-4 px-4 pb-2">
              {selectedStocks.map((stock) => (
                <div key={stock.symbol} className="min-w-[150px] flex-shrink-0 border-t border-border/60 pt-3 relative">
                  <button
                    className="absolute -top-1 right-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => removeStock(stock.symbol)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-bold text-primary">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{stock.symbol}</div>
                      <div className="text-[9px] text-muted-foreground">{stock.sector}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular">KES {stock.price.toFixed(2)}</div>
                  <div className={`text-[11px] flex items-center gap-0.5 tabular ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </div>
                  <div className="mt-2">
                    <SparklineChart isPositive={stock.change >= 0} width={130} height={26} />
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Comparison table — flat */}
        {selectedStocks.length >= 2 && (
          <div>
            <p className="section-eyebrow mb-2 flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-accent" /> Detailed Comparison
            </p>
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-y border-border/60">
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground sticky left-0 bg-background">Metric</th>
                    {selectedStocks.map((stock) => (
                      <th key={stock.symbol} className="text-center py-2 px-3 font-semibold min-w-[90px]">
                        {stock.symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((metric) => {
                    const Icon = metric.icon;
                    const isHigherBetter = !['pe', 'debtToEquity', 'beta'].includes(metric.key);
                    const bestSymbol = getBestValue(metric.key, isHigherBetter);

                    return (
                      <tr key={metric.key} className="border-b border-border/40">
                        <td className="py-2.5 px-4 font-medium sticky left-0 bg-background">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {metric.label}
                          </div>
                        </td>
                        {selectedStocks.map((stock) => {
                          const value = stock[metric.key as keyof Stock];
                          const isBest = bestSymbol === stock.symbol;
                          const numValue = typeof value === 'number' ? value : 0;
                          const colorClass = metric.colorize && typeof value === 'number'
                            ? numValue >= 0 ? 'text-bull' : 'text-bear'
                            : '';

                          return (
                            <td
                              key={stock.symbol}
                              className={`text-center py-2.5 px-3 tabular ${isBest ? 'font-bold text-primary' : ''} ${colorClass}`}
                            >
                              {typeof value === 'number'
                                ? (metric.format as (v: number) => string)(value)
                                : (metric.format as (v: string) => string)(value as string)}
                              {isBest && <span className="ml-1">★</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedStocks.length === 0 && (
          <div className="text-center py-14">
            <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold mb-2">Compare Stocks</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Add 2–4 stocks to compare performance, valuation and key metrics side-by-side.
            </p>
            <Button onClick={() => setShowSearch(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add First Stock
            </Button>
          </div>
        )}

        {selectedStocks.length === 1 && (
          <div className="border-t border-b border-primary/25 bg-primary/5 -mx-4 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Add at least one more stock to start comparing</p>
          </div>
        )}
      </div>
    </div>
  );
}
