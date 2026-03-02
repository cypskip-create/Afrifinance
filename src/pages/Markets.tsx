import { TrendingUp, TrendingDown, BarChart3, Coins, Globe, Brain, Building2, Layers, Box, Clock, Calendar, Star, ArrowUpRight, ArrowDownRight, Zap, Award, AlertCircle, ChevronRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/shared/TopBar";
import { useNavigate } from "react-router-dom";
import * as WatchlistHook from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { MarketStatusIndicator } from "@/components/shared/MarketStatusIndicator";
import { SparklineChart } from "@/components/shared/SparklineChart";
import { AllStocksList } from "@/components/markets/AllStocksList";
import { Progress } from "@/components/ui/progress";

export default function Markets() {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = WatchlistHook.useWatchlist();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState("stocks");

  const marketCategories = [
    { id: "stocks", label: "Stocks", icon: Building2 },
    { id: "etfs", label: "ETFs", icon: Layers },
    { id: "commodities", label: "Commodities", icon: Box },
    { id: "bonds", label: "Bonds", icon: Coins },
    { id: "global", label: "Global", icon: Globe },
  ];

  const topGainers = [
    { symbol: "EQTY", name: "Equity Group", price: "62.50", change: 13.12, volume: "2.4M" },
    { symbol: "SAFCOM", name: "Safaricom PLC", price: "12.85", change: 1.18, volume: "8.1M" },
    { symbol: "KCB", name: "KCB Group", price: "45.20", change: 0.85, volume: "1.2M" },
    { symbol: "NCBA", name: "NCBA Group", price: "38.75", change: 3.45, volume: "890K" },
    { symbol: "COOP", name: "Co-operative Bank", price: "15.40", change: 2.10, volume: "1.5M" },
  ];

  const topLosers = [
    { symbol: "BAMB", name: "Bamburi Cement", price: "85.30", change: -2.4, volume: "340K" },
    { symbol: "EABL", name: "EABL", price: "142.00", change: -1.8, volume: "520K" },
    { symbol: "SCBK", name: "Standard Chartered", price: "168.50", change: -0.9, volume: "180K" },
    { symbol: "TOTL", name: "TotalEnergies", price: "22.10", change: -4.1, volume: "95K" },
    { symbol: "BAT", name: "BAT Kenya", price: "320.00", change: -1.5, volume: "45K" },
  ];

  const indices = [
    { name: "NSE 20", value: "1,847.23", change: 1.2, isUp: true, points: "+22.1" },
    { name: "NSE 25", value: "3,542.87", change: 0.8, isUp: true, points: "+28.3" },
    { name: "All Share (NASI)", value: "112.45", change: -0.3, isUp: false, points: "-0.34" },
    { name: "S&P 500", value: "4,532.76", change: 0.5, isUp: true, points: "+22.7" },
    { name: "NASDAQ", value: "14,823.43", change: -0.2, isUp: false, points: "-29.6" },
    { name: "FTSE 100", value: "7,634.21", change: 0.3, isUp: true, points: "+22.9" },
  ];

  const futures = [
    { name: "Gold", value: "$2,342.50", change: 0.8, isUp: true },
    { name: "Brent Crude", value: "$82.15", change: -1.2, isUp: false },
    { name: "Silver", value: "$27.85", change: 1.5, isUp: true },
    { name: "Natural Gas", value: "$2.18", change: -0.6, isUp: false },
  ];

  const sectors = [
    { name: "Banking", change: 2.4, isUp: true, marketCap: "KES 1.2T", topStock: "EQTY" },
    { name: "Telecommunications", change: 1.8, isUp: true, marketCap: "KES 890B", topStock: "SAFCOM" },
    { name: "Energy", change: -1.2, isUp: false, marketCap: "KES 120B", topStock: "KPLC" },
    { name: "Manufacturing", change: 0.7, isUp: true, marketCap: "KES 340B", topStock: "BAMB" },
    { name: "Insurance", change: -0.4, isUp: false, marketCap: "KES 180B", topStock: "BRIT" },
    { name: "Agriculture", change: 1.1, isUp: true, marketCap: "KES 95B", topStock: "SASN" },
  ];

  const upcomingEvents = [
    { date: "Mar 5", title: "EQTY Q4 Earnings", type: "earnings", impact: "high" },
    { date: "Mar 7", title: "CBK Interest Rate Decision", type: "economic", impact: "high" },
    { date: "Mar 10", title: "SAFCOM Dividend Ex-Date", type: "dividend", impact: "medium" },
    { date: "Mar 12", title: "KCB AGM", type: "corporate", impact: "medium" },
    { date: "Mar 15", title: "Kenya CPI Data Release", type: "economic", impact: "high" },
  ];

  const analystRatings = [
    { symbol: "SAFCOM", rating: "Buy", target: "15.50", current: "12.85", upside: 20.6, firm: "Genghis Capital" },
    { symbol: "EQTY", rating: "Strong Buy", target: "75.00", current: "62.50", upside: 20.0, firm: "SBG Securities" },
    { symbol: "KCB", rating: "Hold", target: "48.00", current: "45.20", upside: 6.2, firm: "Dyer & Blair" },
    { symbol: "SCBK", rating: "Sell", target: "155.00", current: "168.50", upside: -8.0, firm: "Standard Investment" },
  ];

  const trendingStocks = [
    { symbol: "EQTY", name: "Equity Group", mentions: 342, sentiment: 85 },
    { symbol: "SAFCOM", name: "Safaricom", mentions: 298, sentiment: 72 },
    { symbol: "KCB", name: "KCB Group", mentions: 156, sentiment: 68 },
    { symbol: "COOP", name: "Co-op Bank", mentions: 98, sentiment: 78 },
  ];

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "earnings": return "bg-accent/10 text-accent border-accent/20";
      case "economic": return "bg-primary/10 text-primary border-primary/20";
      case "dividend": return "bg-bull/10 text-bull border-bull/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Markets" 
        subtitle="Global market overview"
        showSearch={true}
        showNotifications={true}
      />

      <div className="p-3 sm:p-4 space-y-4">
        {/* Market Status + Timestamp */}
        <div className="flex items-center justify-between animate-fade-in">
          <MarketStatusIndicator />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
          </div>
        </div>

        {/* Live Indices Ticker */}
        <div className="animate-fade-in -mx-3 sm:-mx-4">
          <div className="overflow-x-auto scrollbar-hide px-3 sm:px-4">
            <div className="flex gap-2 min-w-max">
              {indices.map((index) => (
                <div
                  key={index.name}
                  className="flex-shrink-0 p-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all min-w-[120px] tap-scale"
                >
                  <div className="text-[10px] font-medium text-muted-foreground mb-0.5">{index.name}</div>
                  <div className="text-sm font-bold">{index.value}</div>
                  <div className={`text-[10px] flex items-center gap-0.5 font-medium ${index.isUp ? 'text-bull' : 'text-bear'}`}>
                    {index.isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    <span>{index.points}</span>
                    <span>({index.isUp ? '+' : ''}{index.change}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Market Summary */}
        <Card className="card-gradient animate-fade-in border-primary/10">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">Market Intelligence</span>
              <Badge variant="secondary" className="text-[10px]">AI</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Banking sector leading gains with EQTY up 13.12% on strong Q4 earnings beat. NSE 20 up 1.2% 
              driven by institutional buying. Watch for CBK rate decision on Mar 7 — markets pricing in a hold.
            </p>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        <div className="animate-fade-in">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {marketCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={category.id === selectedCategory ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 text-xs whitespace-nowrap h-9 shrink-0 ${
                    category.id === selectedCategory ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-4 mt-0">
            {/* Futures & Commodities Row */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Futures & Commodities
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {futures.map((item) => (
                    <div key={item.name} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-[10px] text-muted-foreground font-medium">{item.name}</div>
                      <div className="text-sm font-bold mt-0.5">{item.value}</div>
                      <div className={`text-[10px] font-medium ${item.isUp ? 'text-bull' : 'text-bear'}`}>
                        {item.isUp ? '+' : ''}{item.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Stocks */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {trendingStocks.map((stock, i) => (
                    <div
                      key={stock.symbol}
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors tap-scale"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                        <div>
                          <div className="text-xs font-semibold">{stock.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{stock.mentions} mentions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={stock.sentiment} className="h-1.5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {stock.sentiment}% 🐂
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Stocks */}
            <AllStocksList />

            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="card-gradient">
                <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-bull uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className="space-y-1.5">
                    {topGainers.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors tap-scale"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-bull/10 flex items-center justify-center text-[10px] font-bold text-bull">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{stock.symbol}</div>
                            <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <SparklineChart isPositive={true} width={40} height={16} />
                          <div className="text-right">
                            <div className="text-xs font-semibold">KES {stock.price}</div>
                            <div className="text-[10px] text-bull font-medium">+{stock.change}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-bear uppercase tracking-wider">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className="space-y-1.5">
                    {topLosers.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors tap-scale"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-bear/10 flex items-center justify-center text-[10px] font-bold text-bear">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{stock.symbol}</div>
                            <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <SparklineChart isPositive={false} width={40} height={16} />
                          <div className="text-right">
                            <div className="text-xs font-semibold">KES {stock.price}</div>
                            <div className="text-[10px] text-bear font-medium">{stock.change}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analyst Ratings */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                    <Award className="h-3.5 w-3.5 text-accent" />
                    Analyst Ratings
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]">Latest</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {analystRatings.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors tap-scale"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold">{stock.symbol}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 ${
                              stock.rating.includes('Buy') ? 'bg-bull/10 text-bull border-bull/20' :
                              stock.rating === 'Hold' ? 'bg-accent/10 text-accent border-accent/20' :
                              'bg-bear/10 text-bear border-bear/20'
                            }`} variant="outline">
                              {stock.rating}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{stock.firm}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium">Target: KES {stock.target}</div>
                        <div className={`text-[10px] font-medium ${stock.upside >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {stock.upside >= 0 ? '+' : ''}{stock.upside}% upside
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="text-center shrink-0 w-10">
                        <div className="text-[10px] text-muted-foreground">{event.date.split(' ')[0]}</div>
                        <div className="text-sm font-bold">{event.date.split(' ')[1]}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{event.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getEventBadgeColor(event.type)}`}>
                            {event.type}
                          </Badge>
                          {event.impact === "high" && (
                            <AlertCircle className="h-3 w-3 text-accent" />
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sector Performance */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <BarChart3 className="h-3.5 w-3.5 text-accent" />
                  Sector Rotation
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {sectors.map((sector) => (
                    <div
                      key={sector.name}
                      onClick={() => navigate(`/sector/${sector.name.toLowerCase()}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors tap-scale"
                    >
                      <div>
                        <div className="text-xs font-semibold">{sector.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {sector.marketCap} · Top: {sector.topStock}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-12 h-1.5 rounded-full overflow-hidden bg-muted`}>
                          <div 
                            className={`h-full rounded-full ${sector.isUp ? 'bg-bull' : 'bg-bear'}`}
                            style={{ width: `${Math.min(Math.abs(sector.change) * 20, 100)}%` }}
                          />
                        </div>
                        <div className={`flex items-center gap-0.5 text-xs font-medium min-w-[50px] justify-end ${sector.isUp ? 'text-bull' : 'text-bear'}`}>
                          {sector.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {sector.isUp ? '+' : ''}{sector.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Heatmap */}
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Market Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { symbol: 'SAFCOM', change: 2.4 },
                    { symbol: 'EQTY', change: 5.2 },
                    { symbol: 'SCBK', change: -1.8 },
                    { symbol: 'BAMB', change: -3.5 },
                    { symbol: 'EABL', change: 1.1 },
                    { symbol: 'KCB', change: 3.7 },
                    { symbol: 'COOP', change: -0.9 },
                    { symbol: 'DTB', change: 2.1 },
                    { symbol: 'ABSA', change: -2.3 },
                    { symbol: 'NCBA', change: 4.2 },
                    { symbol: 'BRIT', change: 1.5 },
                    { symbol: 'ARM', change: 3.3 },
                  ].map((stock, i) => {
                    const intensity = Math.abs(stock.change);
                    const isPositive = stock.change >= 0;
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className={`rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105 aspect-square ${
                          isPositive 
                            ? intensity > 3 ? 'bg-bull/40 text-bull' :
                              intensity > 1.5 ? 'bg-bull/25 text-bull' :
                              'bg-bull/10 text-bull'
                            : intensity > 3 ? 'bg-bear/40 text-bear' :
                              intensity > 1.5 ? 'bg-bear/25 text-bear' :
                              'bg-bear/10 text-bear'
                        }`}
                      >
                        <div className="text-[10px] font-bold">{stock.symbol}</div>
                        <div className="text-[10px] font-semibold">
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ETFs Tab */}
          <TabsContent value="etfs" className="space-y-4 mt-0">
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-semibold">Exchange Traded Funds</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { name: "NSE ETF", ticker: "NSETF", price: "45.20", change: 1.5, aum: "KES 2.1B" },
                    { name: "ABSA Money Market", ticker: "ABSMMF", price: "10.05", change: 0.2, aum: "KES 8.5B" },
                    { name: "Old Mutual Balanced", ticker: "OMBF", price: "22.80", change: 0.8, aum: "KES 4.2B" },
                  ].map((etf) => (
                    <div key={etf.ticker} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                      <div>
                        <div className="text-xs font-semibold">{etf.name}</div>
                        <div className="text-[10px] text-muted-foreground">{etf.ticker} · AUM: {etf.aum}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold">KES {etf.price}</div>
                        <div className="text-[10px] text-bull">+{etf.change}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commodities Tab */}
          <TabsContent value="commodities" className="space-y-4 mt-0">
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-semibold">Commodities</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { name: "Gold", price: "$2,342.50", change: 0.8, isUp: true },
                    { name: "Silver", price: "$27.85", change: 1.5, isUp: true },
                    { name: "Brent Crude", price: "$82.15", change: -1.2, isUp: false },
                    { name: "Tea (Mombasa Auction)", price: "$2.45/kg", change: 2.1, isUp: true },
                    { name: "Coffee (Nairobi)", price: "$3.80/kg", change: -0.5, isUp: false },
                  ].map((commodity) => (
                    <div key={commodity.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2.5">
                        <SparklineChart isPositive={commodity.isUp} width={40} height={16} />
                        <div>
                          <div className="text-xs font-semibold">{commodity.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold">{commodity.price}</div>
                        <div className={`text-[10px] font-medium ${commodity.isUp ? 'text-bull' : 'text-bear'}`}>
                          {commodity.isUp ? '+' : ''}{commodity.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-4 mt-0">
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-semibold">Government Bonds</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { name: "91-Day T-Bill", yield: "16.84%", change: 0.12 },
                    { name: "182-Day T-Bill", yield: "16.92%", change: -0.05 },
                    { name: "364-Day T-Bill", yield: "16.97%", change: 0.08 },
                    { name: "10-Year Bond", yield: "17.25%", change: 0.15 },
                    { name: "15-Year Bond", yield: "17.50%", change: -0.02 },
                  ].map((bond) => (
                    <div key={bond.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                      <div className="text-xs font-semibold">{bond.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{bond.yield}</span>
                        <span className={`text-[10px] ${bond.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                          {bond.change >= 0 ? '+' : ''}{bond.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Tab */}
          <TabsContent value="global" className="space-y-4 mt-0">
            <Card className="card-gradient">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-semibold">Global Markets</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="space-y-2">
                  {[
                    { name: "S&P 500", value: "4,532.76", change: 0.5, isUp: true, region: "US" },
                    { name: "NASDAQ", value: "14,823.43", change: -0.2, isUp: false, region: "US" },
                    { name: "FTSE 100", value: "7,634.21", change: 0.3, isUp: true, region: "UK" },
                    { name: "Nikkei 225", value: "38,892.15", change: 1.1, isUp: true, region: "JP" },
                    { name: "JSE Top 40", value: "69,234.50", change: -0.4, isUp: false, region: "SA" },
                    { name: "Nigeria ASI", value: "98,567.23", change: 0.7, isUp: true, region: "NG" },
                  ].map((market) => (
                    <div key={market.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-[10px] px-1.5">{market.region}</Badge>
                        <div>
                          <div className="text-xs font-semibold">{market.name}</div>
                          <div className="text-[10px] text-muted-foreground">{market.value}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-0.5 text-xs font-medium ${market.isUp ? 'text-bull' : 'text-bear'}`}>
                        {market.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {market.isUp ? '+' : ''}{market.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}