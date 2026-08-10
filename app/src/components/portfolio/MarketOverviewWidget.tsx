import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Clock, Globe, Zap } from "lucide-react";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

const MARKET_INDICES: MarketIndex[] = [
  { name: 'NSE 20', value: 1845.32, change: 12.45, changePercent: 0.68 },
  { name: 'NSE 25', value: 3256.78, change: -8.92, changePercent: -0.27 },
  { name: 'NASI', value: 98.45, change: 0.32, changePercent: 0.33 },
  { name: 'S&P 500', value: 5234.18, change: 45.67, changePercent: 0.88 },
];

const MARKET_STATS = {
  advancers: 32,
  decliners: 18,
  unchanged: 12,
  volume: '125.4M',
  turnover: 'KES 892M',
};

export function MarketOverviewWidget() {
  const currentHour = new Date().getHours();
  const isMarketHours = currentHour >= 9 && currentHour < 15;

  return (
    <div className="space-y-4">
      {/* Market Status Header */}
      <Card className="card-gradient overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Market Overview</h3>
                  <MarketStatusIndicator />
                </div>
              </div>
              <Badge variant={isMarketHours ? "default" : "secondary"} className="gap-1">
                <Activity className="h-3 w-3" />
                {isMarketHours ? 'Live' : 'Closed'}
              </Badge>
            </div>

            {/* Indices Grid */}
            <div className="grid grid-cols-2 gap-3">
              {MARKET_INDICES.map((index) => (
                <div 
                  key={index.name}
                  className="p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{index.name}</span>
                    {index.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-bull" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-bear" />
                    )}
                  </div>
                  <p className="text-lg font-bold">{index.value.toLocaleString()}</p>
                  <p className={`text-xs font-medium ${index.changePercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {index.changePercent >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Market Breadth */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Market Breadth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Advancers vs Decliners */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-bull font-medium">Advancers ({MARKET_STATS.advancers})</span>
              <span className="text-bear font-medium">Decliners ({MARKET_STATS.decliners})</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-bull to-bull/80"
                style={{ width: `${(MARKET_STATS.advancers / (MARKET_STATS.advancers + MARKET_STATS.decliners)) * 100}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-bear/80 to-bear"
                style={{ width: `${(MARKET_STATS.decliners / (MARKET_STATS.advancers + MARKET_STATS.decliners)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {MARKET_STATS.unchanged} unchanged
            </p>
          </div>

          {/* Volume & Turnover */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="text-lg font-bold">{MARKET_STATS.volume}</p>
              <p className="text-xs text-bull">+12% vs avg</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Turnover</p>
              <p className="text-lg font-bold">{MARKET_STATS.turnover}</p>
              <p className="text-xs text-bull">+8% vs avg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Session Info */}
      <Card className="card-gradient">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">NSE Trading Hours</p>
              <p className="text-xs text-muted-foreground">
                Mon-Fri: 9:00 AM - 3:00 PM EAT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
