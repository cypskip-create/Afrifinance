import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import { SectorAllocationChart } from "@/components/portfolio/SectorAllocationChart";
import { DividendTracker } from "@/components/portfolio/DividendTracker";
import { MarketOverviewWidget } from "@/components/portfolio/MarketOverviewWidget";
import { 
  Trash2, TrendingUp, TrendingDown, Calendar, ArrowLeft, Briefcase, Banknote, 
  Activity, Eye, EyeOff, MoreHorizontal, Plus, RefreshCw, Bell,
  PieChart, LineChart, BarChart3, Wallet, Target, Percent, DollarSign, ArrowUpRight, ArrowDownRight, Share
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SparklineChart } from "@/components/shared/SparklineChart";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function TrackInvestments() {
  const { portfolio, loading, removeFromPortfolio, addToPortfolio, refetch } = usePortfolio();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getCurrentPrice = (symbol: string) => {
    const prices: Record<string, number> = {
      SAFCOM: 12.85, EQTY: 62.50, SCBK: 185.00, BAMB: 89.75, KCB: 45.30, COOP: 15.20,
    };
    return prices[symbol] || Math.random() * 100 + 10;
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0, totalCost = 0;
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
    const sectorMap: Record<string, number> = {};
    portfolio.forEach((item) => {
      const currentPrice = getCurrentPrice(item.symbol);
      const value = currentPrice * item.shares;
      const sector = item.sector || 'Other';
      sectorMap[sector] = (sectorMap[sector] || 0) + value;
    });
    return Object.entries(sectorMap).map(([name, value]) => ({ name, value: Math.round(value) }));
  };

  const handleDelete = async (id: string) => {
    const result = await removeFromPortfolio(id);
    if (result.error) toast({ title: "Error", description: "Failed to remove", variant: "destructive" });
    else toast({ title: "Removed", description: "Investment removed from portfolio" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({ title: "Updated", description: "Latest prices loaded" });
  };

  const stats = calculatePortfolioStats();
  const todayGain = stats.totalGain * 0.15;
  const todayGainPercent = stats.gainPercentage * 0.15;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Portfolio</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">My Portfolio</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
                Market Open
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className={`rounded-full ${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/notifications')}>
              <Bell className="h-4 w-4" />
            </Button>
            <AddTradeDialog onTradeAdded={addToPortfolio} />
          </div>
        </div>
      </header>
      
      <div className="px-4 pt-4 space-y-5">
        {/* Hero Value Card */}
        <Card className="soft-card border-0 bg-gradient-to-br from-primary/8 via-card to-accent/5 overflow-hidden animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Portfolio Value</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <h2 className="text-4xl font-bold tracking-tight mb-1">
              {showBalance ? `KES ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </h2>
            
            <div className="flex items-center gap-4 mb-5">
              <div className={`flex items-center gap-1 ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                {stats.totalGain >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="font-semibold text-sm">
                  {showBalance ? `${stats.totalGain >= 0 ? '+' : ''}KES ${Math.abs(stats.totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </span>
                <span className="text-xs">({stats.gainPercentage >= 0 ? '+' : ''}{stats.gainPercentage.toFixed(2)}%)</span>
              </div>
              <Badge variant="secondary" className="text-xs rounded-full bg-primary/10 text-primary border-0">All time</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/60 rounded-2xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  Today
                </div>
                <div className={`font-semibold ${todayGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {showBalance ? `${todayGain >= 0 ? '+' : ''}KES ${Math.abs(todayGain).toFixed(2)}` : '••••'}
                  <span className="text-xs ml-1">({todayGainPercent >= 0 ? '+' : ''}{todayGainPercent.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="bg-background/60 rounded-2xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Wallet className="h-3 w-3" />
                  Invested
                </div>
                <div className="font-semibold">
                  {showBalance ? `KES ${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 animate-fade-in">
          {[
            { icon: Briefcase, label: "Holdings", value: portfolio.length, color: "text-primary" },
            { icon: Target, label: "Sectors", value: getSectorAllocation().length, color: "text-accent" },
            { icon: Percent, label: "Win Rate", value: "73%", color: "text-bull" },
            { icon: Activity, label: "Trades", value: "12", color: "text-primary" },
          ].map((stat, idx) => (
            <Card key={idx} className="soft-card p-3 text-center">
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="holdings" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/40 rounded-2xl">
            {[
              { value: "holdings", icon: Briefcase, label: "Holdings" },
              { value: "performance", icon: LineChart, label: "Chart" },
              { value: "allocation", icon: PieChart, label: "Sectors" },
              { value: "dividends", icon: Banknote, label: "Income" },
              { value: "market", icon: BarChart3, label: "Market" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <tab.icon className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="holdings" className="space-y-3 mt-4">
            {portfolio.length === 0 ? (
              <Card className="soft-card border-dashed border-2 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Start Building Your Portfolio</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add your first investment to begin tracking.</p>
                  <AddTradeDialog onTradeAdded={addToPortfolio} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Top Movers in Portfolio */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {portfolio.slice(0, 4).map((item) => {
                    const currentPrice = getCurrentPrice(item.symbol);
                    const gain = ((currentPrice - item.avg_cost) / item.avg_cost) * 100;
                    return (
                      <Badge key={item.id} variant="secondary" className={`whitespace-nowrap rounded-full px-3 py-1.5 cursor-pointer text-xs font-semibold ${gain >= 0 ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`} onClick={() => navigate(`/stock/${item.symbol}`)}>
                        ${item.symbol} {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                      </Badge>
                    );
                  })}
                </div>
                
                {portfolio.map((item) => {
                  const currentPrice = getCurrentPrice(item.symbol);
                  const totalValue = currentPrice * item.shares;
                  const totalCost = item.avg_cost * item.shares;
                  const gain = totalValue - totalCost;
                  const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                  const isPositive = gain >= 0;
                  const weight = (totalValue / stats.totalValue) * 100;

                  return (
                    <Card key={item.id} className="soft-card overflow-hidden">
                      <div className="p-4 cursor-pointer" onClick={() => navigate(`/stock/${item.symbol}`)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center font-bold text-sm text-primary">
                              {item.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{item.symbol}</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full bg-muted">
                                  {weight.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.name}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/stock/${item.symbol}`); }}>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Set Alert</DropdownMenuItem>
                              <DropdownMenuItem>Add More</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-3 gap-4 text-sm flex-1">
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
                          <div className="flex flex-col items-end gap-1">
                            <SparklineChart isPositive={isPositive} width={60} height={24} />
                            <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-bull' : 'text-bear'}`}>
                              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={weight} className="h-1 mt-3 rounded-full" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-4">
            <RobinhoodPerformanceChart currentValue={stats.totalValue} initialValue={stats.totalCost} />
            <div className="grid grid-cols-2 gap-3">
              <Card className="soft-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-xl ${stats.gainPercentage >= 0 ? 'bg-bull/10' : 'bg-bear/10'}`}>
                    {stats.gainPercentage >= 0 ? <TrendingUp className="h-4 w-4 text-bull" /> : <TrendingDown className="h-4 w-4 text-bear" />}
                  </div>
                  <span className="text-xs text-muted-foreground">Total Return</span>
                </div>
                <div className={`text-xl font-bold ${stats.gainPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stats.gainPercentage >= 0 ? '+' : ''}{stats.gainPercentage.toFixed(2)}%
                </div>
              </Card>
              <Card className="soft-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Net Profit</span>
                </div>
                <div className={`text-xl font-bold ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {stats.totalGain >= 0 ? '+' : ''}KES {Math.abs(stats.totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="mt-4">
            <SectorAllocationChart data={getSectorAllocation()} totalValue={stats.totalValue} gainPercentage={stats.gainPercentage} />
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
