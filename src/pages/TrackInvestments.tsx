import { TopBar } from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/hooks/usePortfolio";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { PortfolioAnalytics } from "@/components/portfolio/PortfolioAnalytics";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen bg-gradient-hero">
        <TopBar title="Track Your Investments" />
        <div className="p-4">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar title="Track Your Investments" subtitle="Monitor your investment performance" />
      
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Investments</h2>
          <AddTradeDialog onTradeAdded={addToPortfolio} />
        </div>

        <PortfolioAnalytics {...stats} />

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
      </div>
    </div>
  );
}