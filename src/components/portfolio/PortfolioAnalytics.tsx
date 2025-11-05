import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PortfolioAnalyticsProps {
  holdings: any[];
  totalValue: number;
  totalCost: number;
}

export function PortfolioAnalytics({ holdings, totalValue, totalCost }: PortfolioAnalyticsProps) {
  // Calculate metrics
  const totalGain = totalValue - totalCost;
  const totalReturn = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;

  // Calculate volatility (simplified - using gain variance)
  const avgGain = totalReturn;
  const variance = holdings.reduce((sum, h) => {
    const holdingReturn = ((h.currentValue - h.cost) / h.cost) * 100;
    return sum + Math.pow(holdingReturn - avgGain, 2);
  }, 0) / Math.max(holdings.length, 1);
  const volatility = Math.sqrt(variance);

  // Risk assessment
  const getRiskLevel = () => {
    if (volatility < 10) return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (volatility < 25) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  const risk = getRiskLevel();

  // Diversification score (0-100)
  const sectorCount = new Set(holdings.map(h => h.sector || 'Unknown')).size;
  const diversificationScore = Math.min(100, (sectorCount / 8) * 100); // Assuming 8 major sectors

  // Sharpe ratio (simplified - assuming risk-free rate of 10%)
  const riskFreeRate = 10;
  const sharpeRatio = volatility > 0 ? (totalReturn - riskFreeRate) / volatility : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Portfolio Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Metrics */}
        <Card className="p-4 bg-gradient-to-br from-background to-accent/5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Risk Assessment</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Risk Level</span>
                <span className={`text-sm font-bold ${risk.color}`}>{risk.level}</span>
              </div>
              <Progress value={volatility} className="h-2" />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Volatility</span>
              <span className="text-sm font-medium">{volatility.toFixed(2)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
              <span className="text-sm font-medium">{sharpeRatio.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Diversification */}
        <Card className="p-4 bg-gradient-to-br from-background to-primary/5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Diversification
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Diversification Score</span>
                <span className="text-sm font-bold text-primary">{diversificationScore.toFixed(0)}/100</span>
              </div>
              <Progress value={diversificationScore} className="h-2" />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Sectors</span>
              <span className="text-sm font-medium">{sectorCount} sectors</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Holdings</span>
              <span className="text-sm font-medium">{holdings.length} stocks</span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 bg-gradient-to-br from-background to-secondary/5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Return</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalReturn >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {totalReturn.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Gain/Loss</span>
              <span className={`text-sm font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                KSh {totalGain.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Portfolio Value</span>
              <span className="text-sm font-medium">KSh {totalValue.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-4 bg-gradient-to-br from-background to-accent/5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">AI Recommendations</h4>
          <div className="space-y-2 text-sm">
            {diversificationScore < 50 && (
              <p className="text-yellow-600 dark:text-yellow-400">
                • Consider diversifying across more sectors
              </p>
            )}
            {volatility > 25 && (
              <p className="text-orange-600 dark:text-orange-400">
                • High volatility detected - consider adding stable stocks
              </p>
            )}
            {totalReturn < 0 && (
              <p className="text-blue-600 dark:text-blue-400">
                • Review underperforming holdings for rebalancing
              </p>
            )}
            {diversificationScore >= 50 && volatility <= 25 && totalReturn >= 0 && (
              <p className="text-green-600 dark:text-green-400">
                • Portfolio is well-balanced with good risk-return profile
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}