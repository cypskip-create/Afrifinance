import { ArrowLeft, Heart, Bell, TrendingUp, TrendingDown, BarChart3, DollarSign, Calendar, Users, Plus, Building, Globe, MessageCircle, Brain, Bot, Activity, Target, TrendingUp as TrendingUpIcon, Award, PieChart, FileText, Banknote, UserCheck, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    
    const isCurrentlyWatchlisted = isInWatchlist(symbol);
    const stockName = stockData[symbol as keyof typeof stockData]?.name || symbol;
    
    if (isCurrentlyWatchlisted) {
      const result = await removeFromWatchlist(symbol);
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to remove from watchlist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Removed from watchlist",
        });
      }
    } else {
      const result = await addToWatchlist(symbol, stockName);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Added to watchlist",
        });
      }
    }
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
              <Heart className={`h-4 w-4 ${isInWatchlist(symbol || '') ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bot className="h-4 w-4" />
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
                    variant={tf === selectedTimeframe ? "default" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} />
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
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="overview" className="text-xs px-2">Overview</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs px-2">Financials</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs px-2">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            {/* Trade Overview */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>Trade Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="text-xs text-muted-foreground">Open</div>
                    <div className="text-xs font-medium">KES {stock.price}</div>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-xs font-medium">2.3M</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money Flow */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUpIcon className="h-4 w-4 text-bull" />
                  <span>Money Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-bull">Inflow</span>
                  <span className="text-xs font-medium text-bull">65%</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2 mb-2">
                  <div className="bg-bull h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-bear">Outflow</span>
                  <span className="text-xs font-medium text-bear">35%</span>
                </div>
              </CardContent>
            </Card>

            {/* Technical Sentiment */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-4 w-4 text-accent" />
                  <span>Technical Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">Bullish</span>
                  <Badge variant="default" className="text-xs">Strong Buy</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  RSI: 68.2 | MACD: Bullish | Moving Avg: Above 50D
                </div>
              </CardContent>
            </Card>

            {/* Short Interest */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm">Short Interest</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Short %</span>
                  <span className="text-xs font-medium">2.1%</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-3 mt-4">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                <TabsTrigger value="estimates" className="text-xs">Estimates</TabsTrigger>
                <TabsTrigger value="statements" className="text-xs">Statements</TabsTrigger>
                <TabsTrigger value="shareholders" className="text-xs">Shareholders</TabsTrigger>
                <TabsTrigger value="dividends" className="text-xs">Dividends</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-3 mt-4">
                {/* Analyst Ratings */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Award className="h-4 w-4 text-accent" />
                      <span>Analyst Ratings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-bull/20 rounded">
                        <div className="text-xs text-bull font-medium">Buy</div>
                        <div className="text-xs">8</div>
                      </div>
                      <div className="p-2 bg-muted/20 rounded">
                        <div className="text-xs font-medium">Hold</div>
                        <div className="text-xs">3</div>
                      </div>
                      <div className="p-2 bg-bear/20 rounded">
                        <div className="text-xs text-bear font-medium">Sell</div>
                        <div className="text-xs">1</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Indicators */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">Key Financial Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROE</span>
                          <span className="text-xs font-medium">18.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROA</span>
                          <span className="text-xs font-medium">12.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">EBITDA Margin</span>
                          <span className="text-xs font-medium">45.2%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">FCF</span>
                          <span className="text-xs font-medium">KES 89.2B</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">P/B Ratio</span>
                          <span className="text-xs font-medium">2.8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Debt/Equity</span>
                          <span className="text-xs font-medium">0.25</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estimates" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">Revenue Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">2024E</span>
                        <span className="text-xs font-medium">KES 298.5B (+12.3%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">2025E</span>
                        <span className="text-xs font-medium">KES 325.7B (+9.1%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">EPS Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">2024E</span>
                        <span className="text-xs font-medium">KES 1.15 (vs 1.04 actual)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">2025E</span>
                        <span className="text-xs font-medium">KES 1.28</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statements" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-accent" />
                      <span>Financial Statements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        <FileText className="h-3 w-3 mr-2" />
                        Income Statement
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        <FileText className="h-3 w-3 mr-2" />
                        Balance Sheet
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        <FileText className="h-3 w-3 mr-2" />
                        Cash Flow Statement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shareholders" className="space-y-3 mt-4">
                {/* Institutional Holdings */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-accent" />
                      <span>Institutional Holdings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                        <span className="text-xs font-medium">Government of Kenya</span>
                        <span className="text-xs">35.0%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                        <span className="text-xs font-medium">Vodacom Group</span>
                        <span className="text-xs">35.0%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                        <span className="text-xs font-medium">Public Shareholders</span>
                        <span className="text-xs">30.0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Earnings Performance */}
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm">Earnings Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Q3 2024</span>
                        <div className="text-right">
                          <div className="text-xs font-medium">Revenue: KES 78.2B</div>
                          <div className="text-xs text-bull">+15.3% YoY</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">EPS</span>
                        <div className="text-right">
                          <div className="text-xs font-medium">KES 0.28 (vs 0.25 est.)</div>
                          <div className="text-xs text-bull">Beat by 12%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dividends" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Banknote className="h-4 w-4 text-accent" />
                      <span>Dividend Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-muted/20 rounded">
                          <div className="text-xs text-muted-foreground">Dividend Per Share</div>
                          <div className="text-sm font-medium">KES {stock.dividend}</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded">
                          <div className="text-xs text-muted-foreground">Yield</div>
                          <div className="text-sm font-medium">4.8%</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium mb-2">Dividend History</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">2024</span>
                            <span className="text-xs font-medium">KES 0.62</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">2023</span>
                            <span className="text-xs font-medium">KES 0.58</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">2022</span>
                            <span className="text-xs font-medium">KES 0.55</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 mt-4">
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

                <div>
                  <h4 className="text-xs font-medium mb-2">Key Leadership</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-xs font-medium">{company.ceo}</span>
                      <span className="text-xs text-muted-foreground">CEO</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-xs font-medium">Dilip Pal</span>
                      <span className="text-xs text-muted-foreground">CFO</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News Section */}
            <Tabs defaultValue="news" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
                <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                <TabsTrigger value="options" className="text-xs">Options</TabsTrigger>
              </TabsList>

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
            </Tabs>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}