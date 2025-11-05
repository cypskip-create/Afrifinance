import { PieChart, Plus, TrendingUp, Calculator, Bot, Coins, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAuth } from "@/hooks/useAuth";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { PortfolioAnalytics } from "@/components/portfolio/PortfolioAnalytics";
import { PriceAlertsManager } from "@/components/alerts/PriceAlertsManager";

export default function Portfolio() {
  const navigate = useNavigate();
  const { holdings: dbHoldings, loading } = usePortfolio();
  const { user } = useAuth();
  
  // Mock current prices for demonstration
  const currentPrices = {
    "SAFCOM": 12.85,
    "EQTY": 62.50,
    "SCBK": 185.00,
    "KCB": 45.20,
    "COOP": 13.40,
  };

  // Transform database holdings to include current values and calculated fields
  const holdings = dbHoldings.map(holding => {
    const currentPrice = currentPrices[holding.symbol as keyof typeof currentPrices] || holding.avg_cost;
    const currentValue = holding.shares * currentPrice;
    const totalCost = holding.shares * holding.avg_cost;
    const change = ((currentPrice - holding.avg_cost) / holding.avg_cost) * 100;
    
    return {
      symbol: holding.symbol,
      name: holding.name,
      shares: holding.shares,
      value: currentValue,
      cost: totalCost,
      change: change,
      sector: holding.sector || "Unknown",
      dividend: 1.20, // Mock dividend data
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  // Sector breakdown calculation
  const sectorBreakdown = holdings.reduce((acc, holding) => {
    if (!acc[holding.sector]) {
      acc[holding.sector] = { value: 0, percentage: 0 };
    }
    acc[holding.sector].value += holding.value;
    return acc;
  }, {} as Record<string, { value: number; percentage: number }>);

  Object.keys(sectorBreakdown).forEach(sector => {
    sectorBreakdown[sector].percentage = (sectorBreakdown[sector].value / totalValue) * 100;
  });

  // Dividend tracking
  const annualDividend = holdings.reduce((sum, holding) => sum + (holding.dividend * holding.shares), 0);
  const dividendYield = (annualDividend / totalValue) * 100;
  
  const recentDividends = [
    { company: "Safaricom", amount: 1200, date: "2024-03-15", type: "Interim" },
    { company: "Equity Group", amount: 1250, date: "2024-02-28", type: "Final" },
    { company: "Standard Chartered", amount: 1000, date: "2024-01-30", type: "Interim" },
  ];
  const totalCost = holdings.reduce((sum, holding) => sum + holding.cost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = ((totalGain / totalCost) * 100);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-primary">Portfolio</h1>
            <p className="text-sm text-muted-foreground">Track your investments</p>
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Price Alerts Section */}
        <PriceAlertsManager />
        
        {/* Portfolio Analytics */}
        <PortfolioAnalytics 
          holdings={holdings}
          totalValue={totalValue}
          totalCost={totalCost}
        />
        {/* Portfolio Summary */}
        <Card className="card-hero">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                KES {totalValue.toLocaleString()}
              </div>
              <div className={`text-lg font-medium ${totalGain >= 0 ? 'text-bull' : 'text-bear'}`}>
                {totalGain >= 0 ? '+' : ''}KES {totalGain.toLocaleString()} ({totalGainPercent.toFixed(1)}%)
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Portfolio Value
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Portfolio performance chart</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <AddTradeDialog>
            <Button className="btn-primary h-12 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
          </AddTradeDialog>
          <Button className="btn-accent h-12">
            <Calculator className="h-4 w-4 mr-2" />
            SIP Calculator
          </Button>
        </div>

        {/* Holdings */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Holdings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {holdings.map((holding) => (
              <div
                key={holding.symbol}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/stock/${holding.symbol}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-muted-foreground">{holding.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">KES {holding.value.toLocaleString()}</div>
                    <div className={`text-sm ${holding.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {holding.change >= 0 ? '+' : ''}{holding.change}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{holding.shares} shares</span>
                  <span>Avg: KES {(holding.cost / holding.shares).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sector Breakdown */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Sector Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(sectorBreakdown).map(([sector, data]) => (
              <div key={sector} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{sector}</span>
                  <span className="text-muted-foreground">
                    {data.percentage.toFixed(1)}% • KES {data.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dividend Tracking */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Coins className="h-5 w-5 text-accent" />
              <span>Dividend Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">
                  KES {annualDividend.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Annual Dividends</div>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">
                  {dividendYield.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Dividend Yield</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground mb-3">Recent Dividends</div>
              {recentDividends.map((dividend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">{dividend.company}</div>
                    <div className="text-sm text-muted-foreground">{dividend.type} • {dividend.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-accent">KES {dividend.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SIP Growth Simulator */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-accent" />
              <span>SIP Growth Simulator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border-2 border-dashed border-accent/30 rounded-lg">
              <Calculator className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Plan Your Investment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Simulate systematic investment plans and track growth potential
              </p>
              <Button className="btn-accent">
                Start Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}