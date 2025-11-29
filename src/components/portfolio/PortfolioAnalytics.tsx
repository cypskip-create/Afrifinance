import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface PortfolioAnalyticsProps {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  gainPercentage: number;
}

export function PortfolioAnalytics({
  totalValue,
  totalCost,
  totalGain,
  gainPercentage,
}: PortfolioAnalyticsProps) {
  const isPositive = totalGain >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-gradient">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current portfolio value</p>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {totalCost.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Amount invested</p>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-bull" />
          ) : (
            <TrendingDown className="h-4 w-4 text-bear" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-bull' : 'text-bear'}`}>
            {isPositive ? '+' : ''}KES {totalGain.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Unrealized gain/loss</p>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gain/Loss %</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-bull" />
          ) : (
            <TrendingDown className="h-4 w-4 text-bear" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-bull' : 'text-bear'}`}>
            {isPositive ? '+' : ''}{gainPercentage.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">Portfolio performance</p>
        </CardContent>
      </Card>
    </div>
  );
}