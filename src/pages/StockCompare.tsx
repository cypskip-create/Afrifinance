import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                Compare Stocks
              </h1>
              <p className="text-xs text-muted-foreground">Side-by-side analysis</p>
            </div>
          </div>
          {selectedStocks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStocks([])}
              className="text-xs text-muted-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Add Stock Section */}
        {selectedStocks.length < 4 && (
          <Card className="card-gradient">
            <CardContent className="p-4">
              {showSearch ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredStocks.slice(0, 6).map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => addStock(stock)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer tap-scale"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{stock.symbol}</div>
                            <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)} className="w-full">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed"
                  onClick={() => setShowSearch(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock to Compare ({selectedStocks.length}/4)
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selected Stocks Cards */}
        {selectedStocks.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {selectedStocks.map((stock) => (
                <Card key={stock.symbol} className="card-gradient min-w-[160px] flex-shrink-0">
                  <CardContent className="p-3 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeStock(stock.symbol)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{stock.symbol}</div>
                        <div className="text-[9px] text-muted-foreground">{stock.sector}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">KES {stock.price.toFixed(2)}</div>
                      <div className={`text-xs flex items-center justify-center gap-0.5 ${stock.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                    <div className="mt-2 flex justify-center">
                      <SparklineChart isPositive={stock.change >= 0} width={80} height={25} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Comparison Table */}
        {selectedStocks.length >= 2 && (
          <Card className="card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                Detailed Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card">Metric</th>
                      {selectedStocks.map((stock) => (
                        <th key={stock.symbol} className="text-center p-3 font-bold min-w-[90px]">
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
                        <tr key={metric.key} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3 font-medium sticky left-0 bg-card">
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
                                className={`text-center p-3 ${isBest ? 'bg-primary/10 font-bold' : ''} ${colorClass}`}
                              >
                                {typeof value === 'number' 
                                  ? (metric.format as (v: number) => string)(value)
                                  : (metric.format as (v: string) => string)(value as string)}
                                {isBest && <span className="ml-1 text-primary">★</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedStocks.length === 0 && (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold mb-2">Compare Stocks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add 2-4 stocks to compare their performance, valuation, and key metrics side by side.
              </p>
              <Button onClick={() => setShowSearch(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Stock
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedStocks.length === 1 && (
          <Card className="card-gradient border-primary/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Add at least one more stock to start comparing
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
