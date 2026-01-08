import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, TrendingUp, AlertTriangle, Shield, Target, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Professional sector color palette - distinct, vibrant colors
const SECTOR_COLORS: { [key: string]: string } = {
  'Technology': '#3B82F6',      // Blue
  'Financial': '#10B981',       // Emerald  
  'Healthcare': '#EC4899',      // Pink
  'Consumer': '#F59E0B',        // Amber
  'Energy': '#EF4444',          // Red
  'Industrial': '#8B5CF6',      // Violet
  'Real Estate': '#06B6D4',     // Cyan
  'Utilities': '#84CC16',       // Lime
  'Materials': '#F97316',       // Orange
  'Telecom': '#6366F1',         // Indigo
  'Banking': '#14B8A6',         // Teal
  'Insurance': '#A855F7',       // Purple
  'Other': '#6B7280',           // Gray
};

interface SectorData {
  name: string;
  value: number;
  percentage?: number;
  change?: number;
}

interface SectorAllocationChartProps {
  data: SectorData[];
  totalValue: number;
  gainPercentage: number;
}

export function SectorAllocationChart({ data, totalValue, gainPercentage }: SectorAllocationChartProps) {
  // Calculate percentages and add mock changes
  const enrichedData = data.map((sector, index) => ({
    ...sector,
    percentage: totalValue > 0 ? (sector.value / totalValue) * 100 : 0,
    change: [-2.3, 1.5, 3.2, -0.8, 2.1, 1.8, -1.2, 0.5][index % 8], // Mock daily changes
    color: SECTOR_COLORS[sector.name] || SECTOR_COLORS['Other']
  }));

  // Risk metrics calculations
  const diversificationScore = Math.min(100, data.length * 15 + 25);
  const topHolding = data.length > 0 ? Math.max(...data.map(d => (d.value / totalValue) * 100)) : 0;
  const riskLevel = topHolding > 50 ? 'High' : topHolding > 30 ? 'Medium' : 'Low';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-sm">{data.name}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-medium">KES {data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Today:</span>
              <span className={`font-medium ${data.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                {data.change >= 0 ? '+' : ''}{data.change}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null; // Don't show label for small slices
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <span>Sector Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Add investments to see sector allocation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Allocation Chart */}
      <Card className="card-gradient overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <span>Sector Allocation</span>
            </CardTitle>
            <Badge variant={riskLevel === 'Low' ? 'default' : riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
              {riskLevel} Concentration
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={enrichedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {enrichedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold">KES</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {(totalValue / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>
            </div>

            {/* Sector List */}
            <div className="w-full lg:w-1/2 space-y-2">
              {enrichedData.map((sector) => (
                <div 
                  key={sector.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: sector.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{sector.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sector.percentage.toFixed(1)}% of portfolio
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">KES {sector.value.toLocaleString()}</p>
                    <div className={`flex items-center justify-end gap-1 text-xs ${sector.change >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {sector.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span>{sector.change >= 0 ? '+' : ''}{sector.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk & Diversification Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Diversification</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{diversificationScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                style={{ width: `${diversificationScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Top Holding</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{topHolding.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topHolding > 40 ? 'Consider rebalancing' : 'Well balanced'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-bull/20">
                <Target className="h-4 w-4 text-bull" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Sectors Held</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{data.length}</span>
              <span className="text-xs text-muted-foreground">sectors</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length >= 4 ? 'Good coverage' : 'Add more sectors'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-full ${gainPercentage >= 0 ? 'bg-bull/20' : 'bg-bear/20'}`}>
                <Zap className={`h-4 w-4 ${gainPercentage >= 0 ? 'text-bull' : 'text-bear'}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">YTD Return</p>
            <div className={`flex items-baseline gap-1 ${gainPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
              <span className="text-xl font-bold">
                {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(1)}
              </span>
              <span className="text-xs">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {gainPercentage >= 10 ? 'Outperforming' : gainPercentage >= 0 ? 'On track' : 'Underperforming'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Insights */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.length < 3 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Low Diversification</p>
                <p className="text-xs text-muted-foreground">
                  Your portfolio is concentrated in {data.length} sector{data.length !== 1 ? 's' : ''}. 
                  Consider adding exposure to other sectors to reduce risk.
                </p>
              </div>
            </div>
          )}
          
          {topHolding > 40 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-bear/10 border border-bear/20">
              <AlertTriangle className="h-5 w-5 text-bear mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Concentration Risk</p>
                <p className="text-xs text-muted-foreground">
                  {topHolding.toFixed(0)}% of your portfolio is in a single sector. 
                  Consider rebalancing to reduce concentration risk.
                </p>
              </div>
            </div>
          )}

          {diversificationScore >= 70 && topHolding <= 40 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-bull/10 border border-bull/20">
              <Shield className="h-5 w-5 text-bull mt-0.5" />
              <div>
                <p className="text-sm font-medium">Well Diversified</p>
                <p className="text-xs text-muted-foreground">
                  Your portfolio has good sector diversification with a score of {diversificationScore}/100. 
                  Keep monitoring for optimal balance.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Portfolio Summary</p>
              <p className="text-xs text-muted-foreground">
                Total value of KES {totalValue.toLocaleString()} across {data.length} sector{data.length !== 1 ? 's' : ''}, 
                with a {gainPercentage >= 0 ? 'gain' : 'loss'} of {Math.abs(gainPercentage).toFixed(2)}%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
