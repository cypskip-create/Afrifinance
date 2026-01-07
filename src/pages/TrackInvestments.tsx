import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { PortfolioAnalytics } from "@/components/portfolio/PortfolioAnalytics";
import { RobinhoodPerformanceChart } from "@/components/portfolio/RobinhoodPerformanceChart";
import { RealtimePriceTicker } from "@/components/shared/RealtimePriceTicker";
import { Trash2, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar, ArrowLeft, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function TrackInvestments() {
  const { portfolio, loading, removeFromPortfolio, addToPortfolio, refetch } = usePortfolio();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    return prices[symbol] || 0;
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

  // Calculate sector allocation
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

  // Mock historical data for performance chart
  const getPerformanceData = () => {
    return [
      { date: 'Jan', value: 45000 },
      { date: 'Feb', value: 48000 },
      { date: 'Mar', value: 46500 },
      { date: 'Apr', value: 52000 },
      { date: 'May', value: 55000 },
      { date: 'Jun', value: stats.totalValue }
    ];
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--bull))', 'hsl(var(--bear))', 'hsl(var(--muted))'];

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

  const stats = calculatePortfolioStats();

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
                <h1 className="text-lg font-bold">Track Your Investments</h1>
                <p className="text-xs text-muted-foreground">Monitor your portfolio</p>
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="tap-scale">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Track Your Investments</h1>
              <p className="text-xs text-muted-foreground">Monitor your portfolio</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-4 space-y-5">
        <div className="flex justify-between items-center animate-fade-in">
          <h2 className="text-xl font-bold">Your Portfolio</h2>
          <AddTradeDialog onTradeAdded={addToPortfolio} />
        </div>

        <div className="animate-fade-in">
          <PortfolioAnalytics {...stats} />
        </div>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-4 mt-4">
            {portfolio.length === 0 ? (
          <Card className="card-gradient">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't added any investments yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Add Investment" to start tracking your portfolio.
              </p>
            </CardContent>
          </Card>
            ) : (
              <div className="space-y-4">
                {portfolio.map((item) => {
              const currentPrice = getCurrentPrice(item.symbol);
              const totalValue = currentPrice * item.shares;
              const totalCost = item.avg_cost * item.shares;
              const gain = totalValue - totalCost;
              const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
              const isPositive = gain >= 0;

              return (
                <Card key={item.id} className="card-gradient">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/stock/${item.symbol}`)}
                      >
                        <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
                          {item.symbol}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                        {item.sector && (
                          <span className="text-xs text-primary">{item.sector}</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="text-sm font-medium">{item.shares}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Cost</p>
                        <p className="text-sm font-medium">KES {item.avg_cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Price</p>
                        <p className="text-sm font-medium">KES {currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Value</p>
                        <p className="text-sm font-medium">KES {totalValue.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Gain/Loss</p>
                        <div className="flex items-center space-x-2">
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-bull" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-bear" />
                          )}
                          <p className={`text-lg font-bold ${isPositive ? 'text-bull' : 'text-bear'}`}>
                            {isPositive ? '+' : ''}KES {gain.toFixed(2)} ({isPositive ? '+' : ''}{gainPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Performance Chart Tab - Robinhood Style */}
          <TabsContent value="performance" className="mt-4 space-y-4">
            <RobinhoodPerformanceChart 
              currentValue={stats.totalValue}
              initialValue={stats.totalCost}
            />
            
            {/* Stats Cards */}
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
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Net Gain</span>
                  </div>
                  <div className={`text-xl font-bold ${stats.totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {stats.totalGain >= 0 ? '+' : ''}KES {Math.abs(stats.totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Tips */}
            <Card className="card-gradient">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Your portfolio has been active for 6 months</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sector Allocation Tab */}
          <TabsContent value="allocation" className="mt-4">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Sector Allocation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Add investments to see sector allocation
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getSectorAllocation()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getSectorAllocation().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {getSectorAllocation().map((sector, index) => (
                        <div key={sector.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{sector.name}</span>
                          </div>
                          <span className="text-sm font-medium">KES {sector.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investment Tips Card */}
            <Card className="card-gradient mt-4">
              <CardHeader>
                <CardTitle className="text-base">Investment Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Diversification</p>
                    <p className="text-xs text-muted-foreground">
                      {getSectorAllocation().length < 3 
                        ? "Consider diversifying across more sectors to reduce risk" 
                        : "Good sector diversification in your portfolio"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-bull" />
                  <div>
                    <p className="text-sm font-medium">Performance</p>
                    <p className="text-xs text-muted-foreground">
                      Your portfolio is {stats.gainPercentage >= 0 ? 'up' : 'down'} {Math.abs(stats.gainPercentage).toFixed(2)}% overall
                    </p>
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