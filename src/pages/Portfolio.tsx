import { PieChart, Plus, TrendingUp, Calculator, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Portfolio() {
  const navigate = useNavigate();
  
  const holdings = [
    { symbol: "SAFCOM", name: "Safaricom", shares: 1000, value: 12850, cost: 11500, change: 11.7 },
    { symbol: "EQTY", name: "Equity Group", shares: 500, value: 31250, cost: 28000, change: 11.6 },
    { symbol: "SCBK", name: "Standard Chartered", shares: 100, value: 18500, cost: 17500, change: 5.7 },
  ];

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
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
          <Button className="btn-primary h-12">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
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