import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { PortfolioAnalytics } from "@/components/portfolio/PortfolioAnalytics";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import { SectorAllocationChart } from "@/components/portfolio/SectorAllocationChart";
import { DividendTracker } from "@/components/portfolio/DividendTracker";
import { MarketOverviewWidget } from "@/components/portfolio/MarketOverviewWidget";
import { 
  Trash2, TrendingUp, TrendingDown, Calendar, ArrowLeft, Briefcase, Banknote, 
  Activity, Eye, EyeOff, MoreHorizontal, Plus, RefreshCw, Bell, ChevronRight,
  PieChart, LineChart, BarChart3, Wallet, Target, Percent, DollarSign, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function TrackInvestments() {
  const { portfolio, loading, removeFromPortfolio, addToPortfolio, refetch } = usePortfolio();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock current prices (in real app, fetch from API)
  const getCurrentPrice = (symbol: string) => {
    const prices: { [key: string]: number } = {
      SAFCOM: 12.85,
      EQTY: 62.50,
      SCBK: 185.00,
      BAMB: 89.75,
      KCB: 45.30,
      COOP: 15.20,
    };
    return prices[symbol] || Math.random() * 100 + 10;
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0;
    let totalCost = 0;

    portfolio.forEach((item) => {
      const currentPrice = getCurrentPrice(item.symbol);
      totalValue += currentPrice * item.shares;
      totalCost += item.avg_cost * item.shares;
    });

    const totalGain = totalValue - totalCost;
    const gainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGain, gainPercentage };
  };

  const getSectorAllocation = () => {
    const sectorMap: { [key: string]: number } = {};
    
    portfolio.forEach((item) => {
      const currentPrice = getCurrentPrice(item.symbol);
      const value = currentPrice * item.shares;
      const sector = item.sector || 'Other';
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
    });

    return Object.entries(sectorMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const handleDelete = async (id: string) => {
    const result = await removeFromPortfolio(id);
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to remove investment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Investment removed from portfolio",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({ title: "Portfolio Updated", description: "Latest prices loaded" });
  };

  const stats = calculatePortfolioStats();
  const todayGain = stats.totalGain * 0.15; // Mock today's gain
  const todayGainPercent = stats.gainPercentage * 0.15;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Portfolio</h1>
                <p className="text-xs text-muted-foreground">Track your investments</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Professional Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Portfolio</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
                Market Open
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              className={isRefreshing ? 'animate-spin' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')}>
              <Bell className="h-4 w-4" />
            </Button>
            <AddTradeDialog onTradeAdded={addToPortfolio} />
          </div>
        </div>
      </header>
      
      <div className="p-4 space-y-5">
        {/* Portfolio Value Header - Robinhood Style */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Total Portfolio Value</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="text-4xl font-bold tracking-tight">
                {showBalance ? `KES ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex items-center gap-1 ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                {stats.totalGain >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="font-semibold">
                  {showBalance ? `${stats.totalGain >= 0 ? '+' : ''}KES ${Math.abs(stats.totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </span>
                <span className="text-sm">({stats.gainPercentage >= 0 ? '+' : ''}{stats.gainPercentage.toFixed(2)}%)</span>
              </div>
              <Badge variant="secondary" className="text-xs">All time</Badge>
            </div>

            {/* Today's Change Mini Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>Today's Change</span>
                </div>
                <div className={`font-semibold ${todayGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {showBalance ? `${todayGain >= 0 ? '+' : ''}KES ${Math.abs(todayGain).toFixed(2)}` : '••••'}
                  <span className="text-xs ml-1">({todayGainPercent >= 0 ? '+' : ''}{todayGainPercent.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="bg-background/50 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet className="h-3 w-3" />
                  <span>Invested</span>
                </div>
                <div className="font-semibold">
                  {showBalance ? `KES ${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Briefcase, label: "Holdings", value: portfolio.length, color: "text-primary" },
            { icon: Target, label: "Sectors", value: getSectorAllocation().length, color: "text-accent" },
            { icon: Percent, label: "Win Rate", value: "73%", color: "text-bull" },
            { icon: Activity, label: "Trades", value: "12", color: "text-primary" },
          ].map((stat, idx) => (
            <Card key={idx} className="card-gradient">
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/30">
            <TabsTrigger value="holdings" className="text-xs py-2 data-[state=active]:bg-background">
              <Briefcase className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Holdings</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs py-2 data-[state=active]:bg-background">
              <LineChart className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="text-xs py-2 data-[state=active]:bg-background">
              <PieChart className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Sectors</span>
            </TabsTrigger>
            <TabsTrigger value="dividends" className="text-xs py-2 data-[state=active]:bg-background">
              <Banknote className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs py-2 data-[state=active]:bg-background">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-3 mt-4">
            {portfolio.length === 0 ? (
              <Card className="card-gradient border-dashed border-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Start Building Your Portfolio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first investment to start tracking your wealth journey.
                  </p>
                  <AddTradeDialog onTradeAdded={addToPortfolio} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {portfolio.map((item) => {
                  const currentPrice = getCurrentPrice(item.symbol);
                  const totalValue = currentPrice * item.shares;
                  const totalCost = item.avg_cost * item.shares;
                  const gain = totalValue - totalCost;
                  const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                  const isPositive = gain >= 0;
                  const weight = (totalValue / stats.totalValue) * 100;

                  return (
                    <Card key={item.id} className="card-gradient overflow-hidden">
                      <CardContent className="p-0">
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => navigate(`/stock/${item.symbol}`)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center font-bold text-sm">
                                {item.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{item.symbol}</span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {weight.toFixed(1)}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{item.name}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/stock/${item.symbol}`); }}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Set Alert</DropdownMenuItem>
                                <DropdownMenuItem>Add More</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">Shares</p>
                                  <p className="font-medium">{item.shares}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Avg Cost</p>
                                  <p className="font-medium">KES {item.avg_cost.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Value</p>
                                  <p className="font-medium">KES {totalValue.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <SparklineChart isPositive={isPositive} width={60} height={24} />
                              <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-bull' : 'text-bear'}`}>
                                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          {/* Weight Progress Bar */}
                          <div className="mt-3">
                            <Progress value={weight} className="h-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-4">
            <RobinhoodPerformanceChart 
              currentValue={stats.totalValue}
              initialValue={stats.totalCost}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-full ${stats.gainPercentage >= 0 ? 'bg-bull/20' : 'bg-bear/20'}`}>
                      {stats.gainPercentage >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-bull" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-bear" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Total Return</span>
                  </div>
                  <div className={`text-xl font-bold ${stats.gainPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stats.gainPercentage >= 0 ? '+' : ''}{stats.gainPercentage.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-full bg-primary/20">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Net Profit</span>
                  </div>
                  <div className={`text-xl font-bold ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stats.totalGain >= 0 ? '+' : ''}KES {Math.abs(stats.totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-gradient">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Your portfolio has been active for 6 months with an average monthly return of {(stats.gainPercentage / 6).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="mt-4">
            <SectorAllocationChart 
              data={getSectorAllocation()}
              totalValue={stats.totalValue}
              gainPercentage={stats.gainPercentage}
            />
          </TabsContent>

          <TabsContent value="dividends" className="mt-4">
            <DividendTracker portfolio={portfolio} />
          </TabsContent>

          <TabsContent value="market" className="mt-4">
            <MarketOverviewWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
