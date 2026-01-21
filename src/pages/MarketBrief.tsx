import { ArrowLeft, TrendingUp, TrendingDown, Calendar, BarChart3, Activity, Zap, Clock, AlertTriangle, CheckCircle2, ChevronRight, Globe, Building2, DollarSign, PieChart, LineChart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function MarketBrief() {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  
  const today = new Date().toLocaleDateString('en-KE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const marketStats = {
    advancers: 23,
    decliners: 15,
    unchanged: 7,
    totalVolume: "12.5M",
    totalTurnover: "KES 456.2M",
    marketCap: "KES 2.1T"
  };

  const sectorPerformance = [
    { name: "Banking", change: 2.4, isUp: true, weight: 42 },
    { name: "Telecom", change: 1.2, isUp: true, weight: 28 },
    { name: "Manufacturing", change: -0.5, isUp: false, weight: 15 },
    { name: "Insurance", change: 0.8, isUp: true, weight: 10 },
    { name: "Energy", change: -1.2, isUp: false, weight: 5 },
  ];

  const analystSentiment = {
    bullish: 58,
    neutral: 28,
    bearish: 14
  };

  const upcomingEvents = [
    { time: "2:00 PM", event: "EABL Earnings Call", type: "earnings" },
    { time: "4:00 PM", event: "NSE Closing Bell", type: "market" },
    { time: "Tomorrow", event: "KCB Q3 Results", type: "earnings" },
    { time: "Thursday", event: "Inflation Data Release", type: "economic" },
  ];

  const allBriefs = [
    {
      symbol: "SCOM",
      name: "Safaricom",
      change: 1.2,
      price: 28.50,
      brief: "Strong performance in Q3 driven by M-Pesa growth. Mobile money transactions up 15% year-over-year.",
      sector: "Telecommunications",
      rating: "Buy",
      targetPrice: 32.00
    },
    {
      symbol: "EQTY",
      name: "Equity Bank",
      change: 2.3,
      price: 52.75,
      brief: "Announces expansion into South Sudan. Regional growth strategy showing positive results.",
      sector: "Banking",
      rating: "Strong Buy",
      targetPrice: 65.00
    },
    {
      symbol: "KCB",
      name: "KCB Group",
      change: -0.8,
      price: 45.20,
      brief: "Fintech partnership announced to enhance digital banking capabilities.",
      sector: "Banking",
      rating: "Hold",
      targetPrice: 48.00
    },
    {
      symbol: "EABL",
      name: "EABL",
      change: 1.5,
      price: 175.00,
      brief: "Earnings call scheduled for 2:00 PM EAT. Market expects strong Q3 results.",
      sector: "Consumer Goods",
      rating: "Buy",
      targetPrice: 195.00
    },
    {
      symbol: "BAT",
      name: "BAT Kenya",
      change: -1.2,
      price: 420.00,
      brief: "Regulatory changes impacting sector outlook. Management to provide guidance update.",
      sector: "Consumer Goods",
      rating: "Sell",
      targetPrice: 380.00
    },
  ];

  const watchlistSymbols = watchlist.map(item => item.symbol);
  const watchlistBriefs = allBriefs.filter(brief => watchlistSymbols.includes(brief.symbol));

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Strong Buy": return "bg-bull/20 text-bull";
      case "Buy": return "bg-bull/10 text-bull";
      case "Hold": return "bg-yellow-500/20 text-yellow-600";
      case "Sell": return "bg-bear/10 text-bear";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const BriefCard = ({ brief }: { brief: typeof allBriefs[0] }) => (
    <Card 
      className="card-gradient hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98]"
      onClick={() => navigate(`/stock/${brief.symbol}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base">{brief.name}</h3>
              <Badge className={`text-[10px] ${getRatingColor(brief.rating)}`}>
                {brief.rating}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{brief.symbol}</span>
              <span>•</span>
              <span>{brief.sector}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">KES {brief.price.toFixed(2)}</div>
            <div className={`flex items-center justify-end text-sm font-medium ${brief.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {brief.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {brief.change >= 0 ? '+' : ''}{brief.change}%
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{brief.brief}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Target: <span className="font-medium text-foreground">KES {brief.targetPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center text-xs text-primary font-medium">
            View Details <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">Market Brief</h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notifications')}
            className="h-9 w-9 p-0"
          >
            <Activity className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Market Overview Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="card-gradient p-3 text-center">
            <div className="text-bull font-bold text-lg">{marketStats.advancers}</div>
            <div className="text-[10px] text-muted-foreground">Advancers</div>
          </Card>
          <Card className="card-gradient p-3 text-center">
            <div className="text-bear font-bold text-lg">{marketStats.decliners}</div>
            <div className="text-[10px] text-muted-foreground">Decliners</div>
          </Card>
          <Card className="card-gradient p-3 text-center">
            <div className="font-bold text-lg">{marketStats.unchanged}</div>
            <div className="text-[10px] text-muted-foreground">Unchanged</div>
          </Card>
        </div>

        {/* Market Summary */}
        <Card className="card-hero">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Summary
              </div>
              <Badge variant="outline" className="text-[10px]">
                <div className="w-1.5 h-1.5 bg-bull rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-bull/10">
                <TrendingUp className="h-4 w-4 text-bull" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">NSE up 1.2% as banking sector rallies</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Equity Bank leads gains on strong Q3 earnings beat, KES steady at 129.5 vs USD
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <BarChart3 className="h-3 w-3" />
                  Volume
                </div>
                <div className="font-bold">{marketStats.totalVolume}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <DollarSign className="h-3 w-3" />
                  Turnover
                </div>
                <div className="font-bold">{marketStats.totalTurnover}</div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-primary">Key Focus</span>
              </div>
              <p className="text-sm">
                EABL earnings call at 2:00 PM EAT, inflation data due Thursday
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analyst Sentiment */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Analyst Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 rounded-full overflow-hidden bg-muted flex">
                <div className="bg-bull h-full" style={{ width: `${analystSentiment.bullish}%` }} />
                <div className="bg-yellow-500 h-full" style={{ width: `${analystSentiment.neutral}%` }} />
                <div className="bg-bear h-full" style={{ width: `${analystSentiment.bearish}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-bull"></div>
                <span>Bullish {analystSentiment.bullish}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Neutral {analystSentiment.neutral}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-bear"></div>
                <span>Bearish {analystSentiment.bearish}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Sector Performance
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/markets')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sectorPerformance.map((sector) => (
              <div 
                key={sector.name} 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => navigate(`/sector/${sector.name.toLowerCase()}`)}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{sector.name}</div>
                    <div className="text-xs text-muted-foreground">{sector.weight}% weight</div>
                  </div>
                </div>
                <div className={`flex items-center font-medium text-sm ${sector.isUp ? 'text-bull' : 'text-bear'}`}>
                  {sector.isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {sector.isUp ? '+' : ''}{sector.change}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${
                    event.type === 'earnings' ? 'bg-primary/10 text-primary' : 
                    event.type === 'market' ? 'bg-bull/10 text-bull' : 
                    'bg-accent/10 text-accent'
                  }`}>
                    {event.type === 'earnings' ? <LineChart className="h-3 w-3" /> : 
                     event.type === 'market' ? <BarChart3 className="h-3 w-3" /> : 
                     <Globe className="h-3 w-3" />}
                  </div>
                  <div className="text-sm">{event.event}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{event.time}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabbed Stock Briefs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all" className="text-xs">All Stocks</TabsTrigger>
            <TabsTrigger value="watchlist" className="text-xs">My Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {allBriefs.map((brief, index) => (
              <BriefCard key={index} brief={brief} />
            ))}
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-3">
            {watchlistBriefs.length > 0 ? (
              watchlistBriefs.map((brief, index) => (
                <BriefCard key={index} brief={brief} />
              ))
            ) : (
              <Card className="card-gradient">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Watchlist Stocks</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add stocks to your watchlist to get personalized briefs
                  </p>
                  <Button onClick={() => navigate('/markets')} className="btn-primary">
                    Browse Markets
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
