import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Clock, Activity, Coins, ExternalLink, Star, Bell, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, ComposedChart, Line } from "recharts";

interface CryptoData {
  name: string;
  symbol: string;
  price: string;
  change: number;
  isUp: boolean;
  marketCap?: string;
  volume24h?: string;
  high24h?: string;
  low24h?: string;
  supply?: string;
  rank?: number;
}

interface CryptoChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crypto: CryptoData | null;
}

const timeframes = ["1H", "24H", "7D", "1M", "3M", "1Y", "ALL"];

// Generate realistic chart data
const generateChartData = (timeframe: string, isUp: boolean) => {
  const dataPoints: { time: string; price: number; volume: number }[] = [];
  let points = 24;
  let basePrice = 43250;
  
  switch (timeframe) {
    case "1H": points = 60; break;
    case "24H": points = 24; break;
    case "7D": points = 7 * 24; break;
    case "1M": points = 30; break;
    case "3M": points = 90; break;
    case "1Y": points = 365; break;
    case "ALL": points = 365 * 3; break;
  }
  
  const trend = isUp ? 0.02 : -0.015;
  
  for (let i = 0; i < Math.min(points, 100); i++) {
    const volatility = (Math.random() - 0.5) * 0.04;
    const trendEffect = (i / points) * trend;
    const price = basePrice * (1 + volatility + trendEffect);
    basePrice = price;
    
    dataPoints.push({
      time: `${i}`,
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 5000000000 + 1000000000),
    });
  }
  
  return dataPoints;
};

export const CryptoChartDialog = ({ open, onOpenChange, crypto }: CryptoChartDialogProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24H");
  const [chartData, setChartData] = useState<{ time: string; price: number; volume: number }[]>([]);
  const [chartType, setChartType] = useState<"area" | "candlestick">("area");
  const [showVolume, setShowVolume] = useState(true);

  useEffect(() => {
    if (crypto) {
      setChartData(generateChartData(selectedTimeframe, crypto.isUp));
    }
  }, [crypto, selectedTimeframe]);

  if (!crypto) return null;

  const priceChange = chartData.length > 0 
    ? ((chartData[chartData.length - 1]?.price - chartData[0]?.price) / chartData[0]?.price * 100).toFixed(2)
    : crypto.change;

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {crypto.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    {crypto.name}
                    {crypto.rank && crypto.rank <= 10 && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {crypto.symbol}
                    {crypto.rank && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Rank #{crypto.rank}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Price Display */}
          <div className="mt-3">
            <div className="text-3xl font-bold">{crypto.price}</div>
            <div className={`flex items-center space-x-2 ${crypto.isUp ? 'text-bull' : 'text-bear'}`}>
              {crypto.isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-semibold text-lg">{crypto.isUp ? '+' : ''}{crypto.change}%</span>
              <span className="text-muted-foreground text-sm">(24h)</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Timeframe Selection */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium whitespace-nowrap"
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowVolume(!showVolume)}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Vol
            </Button>
          </div>

          {/* Chart */}
          <div className="bg-muted/20 rounded-xl p-3">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={crypto.isUp ? "hsl(var(--bull))" : "hsl(var(--bear))"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={crypto.isUp ? "hsl(var(--bull))" : "hsl(var(--bear))"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    width={50}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'price') return [`$${value.toLocaleString()}`, 'Price'];
                      if (name === 'volume') return [`$${(value / 1000000000).toFixed(2)}B`, 'Volume'];
                      return [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={crypto.isUp ? "hsl(var(--bull))" : "hsl(var(--bear))"}
                    fill="url(#cryptoGradient)"
                    strokeWidth={2}
                  />
                  {showVolume && (
                    <Bar 
                      dataKey="volume" 
                      fill="hsl(var(--muted-foreground))" 
                      opacity={0.3}
                      yAxisId="volume"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Price Range Indicator */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Low: </span>
                <span className="text-bear font-medium">${minPrice.toLocaleString()}</span>
              </div>
              <div className="flex-1 mx-3 h-1.5 bg-gradient-to-r from-bear via-muted to-bull rounded-full relative">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full shadow-lg"
                  style={{ 
                    left: `${maxPrice > minPrice 
                      ? ((chartData[chartData.length - 1]?.price || minPrice) - minPrice) / (maxPrice - minPrice) * 100 
                      : 50}%` 
                  }}
                />
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">High: </span>
                <span className="text-bull font-medium">${maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Key Statistics
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {crypto.marketCap && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <BarChart3 className="h-3 w-3" />
                    Market Cap
                  </div>
                  <div className="font-semibold">{crypto.marketCap}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {crypto.rank && `#${crypto.rank} by market cap`}
                  </div>
                </div>
              )}
              
              {crypto.volume24h && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    24h Volume
                  </div>
                  <div className="font-semibold">{crypto.volume24h}</div>
                  <div className="text-[10px] text-bull mt-0.5">+5.2% vs avg</div>
                </div>
              )}
              
              {crypto.high24h && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">24h High</div>
                  <div className="font-semibold text-bull">{crypto.high24h}</div>
                </div>
              )}
              
              {crypto.low24h && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">24h Low</div>
                  <div className="font-semibold text-bear">{crypto.low24h}</div>
                </div>
              )}
            </div>
            
            {crypto.supply && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <Coins className="h-3 w-3" />
                  Circulating Supply
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{crypto.supply}</div>
                  <div className="text-xs text-muted-foreground">
                    {crypto.symbol === 'BTC' && '21M max supply'}
                  </div>
                </div>
                {crypto.symbol === 'BTC' && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '93.3%' }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">93.3% of max supply</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Market Sentiment */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Market Sentiment</h4>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Buy / Sell Pressure</span>
                <span className="text-xs font-medium text-bull">62% Bullish</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div className="bg-bull h-full" style={{ width: '62%' }} />
                <div className="bg-bear h-full" style={{ width: '38%' }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Buyers</span>
                <span>Sellers</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 btn-primary">
              Add to Watchlist
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Exchange
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
