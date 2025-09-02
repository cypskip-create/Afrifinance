import { ArrowLeft, Heart, Bell, TrendingUp, TrendingDown, BarChart3, DollarSign, Calendar, Users, Plus, Building, Globe, MessageCircle, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const handleWatchlistToggle = () => {
    setIsWatchlisted(!isWatchlisted);
    // Add to toast notification later
  };

  const stockData = {
    SAFCOM: {
      name: "Safaricom PLC",
      price: "12.85",
      change: "0.15",
      changePercent: "1.18",
      isUp: true,
      marketCap: "515.2B",
      pe: "12.4",
      eps: "1.04",
      dividend: "0.62",
      high52: "14.20",
      low52: "10.80"
    },
    EQTY: {
      name: "Equity Group Holdings",
      price: "62.50",
      change: "7.25",
      changePercent: "13.12",
      isUp: true,
      marketCap: "237.3B",
      pe: "8.2",
      eps: "7.62",
      dividend: "2.50",
      high52: "68.00",
      low52: "45.25"
    }
  };

  const stock = stockData[symbol as keyof typeof stockData] || stockData.SAFCOM;

  const timeframes = ["1D", "1W", "1M", "6M", "1Y", "5Y", "Max"];

  const companyInfo = {
    SAFCOM: {
      description: "Safaricom PLC is a leading mobile network operator in Kenya providing mobile telephony, mobile money transfer and wireless data services.",
      sector: "Telecommunications",
      headquarters: "Nairobi, Kenya",
      ceo: "Peter Ndegwa",
      employees: "6,500+",
      founded: "1997"
    },
    EQTY: {
      description: "Equity Group Holdings PLC is a financial services group headquartered in Nairobi, Kenya.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya", 
      ceo: "James Mwangi",
      employees: "15,000+",
      founded: "1984"
    }
  };

  const company = companyInfo[symbol as keyof typeof companyInfo] || companyInfo.SAFCOM;
  
  const newsItems = [
    {
      title: `${stock.name} Q3 Results Beat Expectations`,
      time: "2h ago",
      source: "Business Daily"
    },
    {
      title: "Telecom Sector Shows Strong Growth",
      time: "4h ago", 
      source: "Capital FM"
    }
  ];

  const communityPosts = [
    {
      user: "TraderKE_Pro",
      content: `Bullish on ${symbol}! Strong fundamentals and great management team.`,
      likes: 24,
      time: "1h ago"
    },
    {
      user: "InvestorJane",
      content: "Perfect entry point for long-term investors.",
      likes: 18,
      time: "3h ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{symbol}</h1>
              <p className="text-xs text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleWatchlistToggle}
            >
              <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Price Card */}
        <Card className="card-hero">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">KES {stock.price}</div>
                <div className={`flex items-center space-x-1 ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
                  {stock.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">
                    {stock.isUp ? '+' : ''}KES {stock.change} ({stock.changePercent}%)
                  </span>
                </div>
              </div>
              <Badge variant={stock.isUp ? "default" : "destructive"}>
                {stock.isUp ? "BUY" : "SELL"}
              </Badge>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Buy/Sell
              </Button>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Simulate Trade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Price Chart</CardTitle>
              <div className="flex space-x-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={tf === "1D" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <div className="text-xs">Interactive chart coming soon</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-sm">Key Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Market Cap</span>
                  <span className="text-xs font-medium">{stock.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">P/E Ratio</span>
                  <span className="text-xs font-medium">{stock.pe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">EPS</span>
                  <span className="text-xs font-medium">{stock.eps}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Dividend</span>
                  <span className="text-xs font-medium">{stock.dividend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">52W High</span>
                  <span className="text-xs font-medium">{stock.high52}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">52W Low</span>
                  <span className="text-xs font-medium">{stock.low52}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
            <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
            <TabsTrigger value="options" className="text-xs">Options</TabsTrigger>
            <TabsTrigger value="company" className="text-xs">Company</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Based on recent performance and market conditions, {stock.name} shows {stock.isUp ? 'positive momentum' : 'consolidation patterns'}. 
                  The stock has strong fundamentals with a P/E ratio of {stock.pe} and consistent dividend payments.
                </p>
                <div className="text-xs">
                  <span className="font-medium text-primary">Key Takeaway:</span> {stock.isUp ? 'Consider for growth portfolio' : 'Monitor for entry opportunities'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm">Related Stocks</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {symbol === 'SAFCOM' ? 
                    ['EQTY - Equity Group', 'KCB - KCB Group', 'COOP - Co-operative Bank'].map((stock, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/20">
                        <span className="text-xs font-medium">{stock}</span>
                        <span className="text-xs text-bull">+1.2%</span>
                      </div>
                    )) :
                    ['SAFCOM - Safaricom', 'SCBK - Standard Chartered', 'DTB - Diamond Trust Bank'].map((stock, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/20">
                        <span className="text-xs font-medium">{stock}</span>
                        <span className="text-xs text-bull">+0.8%</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <Card className="card-gradient">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Interactive Chart</CardTitle>
                  <div className="flex space-x-1">
                    {timeframes.map((tf) => (
                      <Button
                        key={tf}
                        variant={tf === "1D" ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <div className="text-xs">Candlestick chart with technical indicators</div>
                    <div className="text-xs opacity-70">Pinch to zoom, drag to pan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-3 mt-4">
            {newsItems.map((news, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-3">
                  <h4 className="text-xs font-medium mb-1">{news.title}</h4>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span>{news.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-3 mt-4">
            {communityPosts.map((post, index) => (
              <Card key={index} className="card-gradient">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium">{post.user}</span>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                  </div>
                  <p className="text-xs mb-2">{post.content}</p>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      👍 {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="options" className="mt-4">
            <Card className="card-gradient">
              <CardContent className="p-4">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-xs">Options chains coming soon</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Building className="h-4 w-4 text-accent" />
                  <span>Company Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium mb-1">About</h4>
                  <p className="text-xs text-muted-foreground">{company.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Sector</div>
                    <div className="text-xs font-medium">{company.sector}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Founded</div>
                    <div className="text-xs font-medium">{company.founded}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">CEO</div>
                    <div className="text-xs font-medium">{company.ceo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Employees</div>
                    <div className="text-xs font-medium">{company.employees}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Headquarters</div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{company.headquarters}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}