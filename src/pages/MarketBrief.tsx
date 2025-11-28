import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const allBriefs = [
    {
      symbol: "SCOM",
      name: "Safaricom",
      change: 1.2,
      price: 28.50,
      brief: "Strong performance in Q3 driven by M-Pesa growth. Mobile money transactions up 15% year-over-year.",
      sector: "Telecommunications"
    },
    {
      symbol: "EQTY",
      name: "Equity Bank",
      change: 2.3,
      price: 52.75,
      brief: "Announces expansion into South Sudan. Regional growth strategy showing positive results.",
      sector: "Banking"
    },
    {
      symbol: "KCB",
      name: "KCB Group",
      change: -0.8,
      price: 45.20,
      brief: "Fintech partnership announced to enhance digital banking capabilities.",
      sector: "Banking"
    },
    {
      symbol: "EABL",
      name: "EABL",
      change: 1.5,
      price: 175.00,
      brief: "Earnings call scheduled for 2:00 PM EAT. Market expects strong Q3 results.",
      sector: "Consumer Goods"
    },
    {
      symbol: "BAT",
      name: "BAT Kenya",
      change: -1.2,
      price: 420.00,
      brief: "Regulatory changes impacting sector outlook. Management to provide guidance update.",
      sector: "Consumer Goods"
    },
  ];

  const watchlistSymbols = watchlist.map(item => item.symbol);
  const watchlistBriefs = allBriefs.filter(brief => watchlistSymbols.includes(brief.symbol));

  const BriefCard = ({ brief }: { brief: typeof allBriefs[0] }) => (
    <Card 
      className="card-gradient hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/stock/${brief.symbol}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{brief.name}</h3>
            <p className="text-sm text-muted-foreground">{brief.symbol}</p>
          </div>
          <div className="text-right">
            <div className="font-semibold">KES {brief.price.toFixed(2)}</div>
            <div className={`flex items-center text-sm ${brief.change >= 0 ? 'text-bull' : 'text-bear'}`}>
              {brief.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {brief.change >= 0 ? '+' : ''}{brief.change}%
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{brief.brief}</p>
        <div className="text-xs text-primary">{brief.sector}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
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
            <h1 className="text-xl font-bold text-primary">Market Brief</h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="p-4">
        {/* Market Summary */}
        <Card className="card-hero mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Market Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-bull mt-0.5" />
              <div>
                <p className="text-sm font-medium">NSE up 1.2% as banking sector rallies</p>
                <p className="text-xs text-muted-foreground">
                  Equity Bank leads gains on strong Q3 earnings beat, KES steady at 129.5 vs USD
                </p>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-sm">
                <span className="font-medium text-primary">Key Focus:</span>{" "}
                EABL earnings call at 2:00 PM EAT, inflation data due Thursday
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Stocks</TabsTrigger>
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
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
                  <p className="text-muted-foreground mb-4">
                    No stocks in your watchlist yet
                  </p>
                  <Button onClick={() => navigate('/discover')}>
                    Discover Stocks
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
