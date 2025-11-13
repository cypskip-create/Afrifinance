import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Bell, Activity, Target, Award, PieChart, FileText, Banknote, UserCheck, Briefcase, Building, Globe, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { BuySharesDialog } from "@/components/stock/BuySharesDialog";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";

export default function StockDetail() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  const stockData = {
    SAFCOM: {
      name: "Safaricom PLC",
      price: 12.85,
      change: 0.15,
      changePercent: "1.18",
      isUp: true,
      marketCap: "515.2B",
      pe: "12.4",
      eps: "1.04",
      dividend: "0.62",
      high52: "14.20",
      low52: "10.80",
      exchange: "NSE",
      sector: "Telecommunications"
    },
    EQTY: {
      name: "Equity Group Holdings",
      price: 62.50,
      change: 7.25,
      changePercent: "13.12",
      isUp: true,
      marketCap: "237.3B",
      pe: "8.2",
      eps: "7.62",
      dividend: "2.50",
      high52: "68.00",
      low52: "45.25",
      exchange: "NSE",
      sector: "Banking"
    },
    SCBK: {
      name: "Standard Chartered",
      price: 185.00,
      change: 5.70,
      changePercent: "5.70",
      isUp: true,
      marketCap: "145.8B",
      pe: "10.5",
      eps: "17.62",
      dividend: "12.50",
      high52: "195.00",
      low52: "165.25",
      exchange: "NSE",
      sector: "Banking"
    }
  };

  const stock = stockData[symbol as keyof typeof stockData] || stockData.SAFCOM;

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
    },
    SCBK: {
      description: "Standard Chartered Bank Kenya Limited is a leading financial services provider in Kenya, offering a wide range of banking products and services.",
      sector: "Banking & Financial Services",
      headquarters: "Nairobi, Kenya",
      ceo: "Kariuki Ngari",
      employees: "1,200+",
      founded: "1911"
    }
  };

  const company = companyInfo[symbol as keyof typeof companyInfo] || companyInfo.SAFCOM;

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    
    const isCurrentlyWatchlisted = isInWatchlist(symbol);
    
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
      const result = await addToWatchlist(symbol, stock.name);
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

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="font-bold">{symbol}</span>
              <span className={stock.isUp ? 'text-bull' : 'text-bear'}>
                {stock.isUp ? '+' : ''}{stock.changePercent}%
              </span>
            </div>
            <div className="text-muted-foreground text-sm">KES {stock.price.toFixed(2)}</div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWatchlistToggle}
              className="bg-primary/10 rounded-full"
            >
              <Heart className={`h-5 w-5 ${isInWatchlist(symbol || '') ? 'fill-primary text-primary' : 'text-primary'}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-orange-500/10 rounded-full"
              onClick={() => setShowAlertsDialog(true)}
            >
              <Bell className="h-5 w-5 text-orange-500" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stock Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{symbol}</h1>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Market Open • Updated just now
          </div>
          
          <div className="text-4xl font-bold">
            KES {stock.price.toFixed(2)}
          </div>
          <div className={`text-lg font-medium flex items-center space-x-1 ${stock.isUp ? 'text-bull' : 'text-bear'}`}>
            <span>{stock.isUp ? '+' : ''}KES {stock.change.toFixed(2)} ({stock.changePercent}%)</span>
          </div>
        </div>

        {/* Market Data Collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-lg">
            <span className="font-medium">Market Data</span>
            <span className="text-xs text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/10 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Open</span>
                  <span className="text-xs font-medium">KES {stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="text-xs font-medium">2.3M</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">High</span>
                  <span className="text-xs font-medium">KES {(stock.price * 1.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs font-medium">KES {(stock.price * 0.98).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <BuySharesDialog symbol={symbol || ''} name={stock.name} price={stock.price}>
            <Button className="h-14 flex-col py-2 bg-primary hover:bg-primary/90 w-full">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-sm font-medium">Buy</span>
            </Button>
          </BuySharesDialog>
          <Button 
            variant="outline" 
            className="h-14 flex-col py-2"
            onClick={() => setShowAlertsDialog(true)}
          >
            <Bell className="h-5 w-5 mb-1" />
            <span className="text-sm">Set Alert</span>
          </Button>
        </div>

        {/* Price Alerts Dialog */}
        {showAlertsDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Price Alerts</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAlertsDialog(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <PriceAlertsManager initialSymbol={symbol} />
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Buttons */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={tf === selectedTimeframe ? "default" : "ghost"}
              size="sm"
              className={`h-9 px-3 text-xs flex-1 ${tf === selectedTimeframe ? 'bg-primary hover:bg-primary/90' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="h-64">
              <StockPriceChart symbol={symbol} timeframe={selectedTimeframe} />
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Chart for {selectedTimeframe} timeframe
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
                    <div className="text-xs font-medium">KES {stock.price.toFixed(2)}</div>
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
                  <TrendingUp className="h-4 w-4 text-bull" />
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
                    <CardTitle className="text-sm">Earnings Estimates</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Q4 2024 Est.</span>
                        <span className="text-xs font-medium">KES 1.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">FY 2024 Est.</span>
                        <span className="text-xs font-medium">KES 4.85</span>
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
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Revenue (TTM)</span>
                        <span className="text-xs font-medium">KES 328.5B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Net Income (TTM)</span>
                        <span className="text-xs font-medium">KES 68.2B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Total Assets</span>
                        <span className="text-xs font-medium">KES 512.8B</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shareholders" className="space-y-3 mt-4">
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-accent" />
                      <span>Major Shareholders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Institutional</span>
                        <span className="text-xs font-medium">45.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Retail</span>
                        <span className="text-xs font-medium">32.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Government</span>
                        <span className="text-xs font-medium">22.0%</span>
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
                      <span>Dividend History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Annual Dividend</span>
                        <span className="text-xs font-medium">KES {stock.dividend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Dividend Yield</span>
                        <span className="text-xs font-medium">{((parseFloat(stock.dividend) / stock.price) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Payout Ratio</span>
                        <span className="text-xs font-medium">45.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 mt-4">
            {/* Company Description */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Building className="h-4 w-4 text-accent" />
                  <span>About {stock.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-accent" />
                  <span>Company Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Sector</div>
                      <div className="text-xs font-medium">{company.sector}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Headquarters</div>
                      <div className="text-xs font-medium">{company.headquarters}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">CEO</div>
                      <div className="text-xs font-medium">{company.ceo}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Employees</div>
                      <div className="text-xs font-medium">{company.employees}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Founded</div>
                      <div className="text-xs font-medium">{company.founded}</div>
                    </div>
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
