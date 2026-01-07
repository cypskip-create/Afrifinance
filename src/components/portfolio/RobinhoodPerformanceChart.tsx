import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceData {
  date: string;
  value: number;
  timestamp: number;
}

interface RobinhoodPerformanceChartProps {
  currentValue: number;
  initialValue: number;
  portfolioData?: PerformanceData[];
}

const timeframes = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 730 },
];

export function RobinhoodPerformanceChart({ 
  currentValue, 
  initialValue,
  portfolioData 
}: RobinhoodPerformanceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Generate mock performance data based on timeframe
  const generateData = (days: number, current: number, initial: number): PerformanceData[] => {
    const data: PerformanceData[] = [];
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const startValue = initial;
    const endValue = current;
    const volatility = 0.02;
    
    // Number of data points based on timeframe
    const points = days <= 1 ? 78 : // 5-min intervals for 1D
                   days <= 7 ? days * 4 : // 6-hour intervals
                   days <= 30 ? days : // daily
                   days <= 90 ? Math.ceil(days / 2) : // every 2 days
                   Math.ceil(days / 7); // weekly
    
    let prevValue = startValue;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const baseValue = startValue + (endValue - startValue) * progress;
      const randomWalk = (Math.random() - 0.5) * volatility * baseValue;
      const smoothing = 0.7;
      const value = prevValue * smoothing + (baseValue + randomWalk) * (1 - smoothing);
      prevValue = value;
      
      const timestamp = now - (points - 1 - i) * (days * msPerDay / points);
      const date = new Date(timestamp);
      
      let dateStr: string;
      if (days <= 1) {
        dateStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (days <= 7) {
        dateStr = date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
      } else if (days <= 30) {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      
      data.push({
        date: dateStr,
        value: Math.max(0, value),
        timestamp
      });
    }
    
    return data;
  };

  const selectedTimeframe = timeframes.find(t => t.label === activeTimeframe)!;
  const chartData = useMemo(
    () => portfolioData || generateData(selectedTimeframe.days, currentValue, initialValue),
    [activeTimeframe, currentValue, initialValue, portfolioData]
  );

  const displayValue = hoverValue ?? currentValue;
  const displayDate = hoverDate ?? "Current Value";
  
  const startValue = chartData[0]?.value || initialValue;
  const changeValue = displayValue - startValue;
  const changePercent = startValue > 0 ? (changeValue / startValue) * 100 : 0;
  const isPositive = changeValue >= 0;

  const gradientId = `performanceGradient-${activeTimeframe}`;
  const lineColor = isPositive ? 'hsl(var(--bull))' : 'hsl(var(--bear))';

  return (
    <Card className="card-gradient overflow-hidden">
      <CardContent className="p-4">
        {/* Value Display - Robinhood style */}
        <div className="mb-4">
          <div className="text-3xl font-bold tracking-tight">
            KES {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center gap-1.5 mt-1 ${isPositive ? 'text-bull' : 'text-bear'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}KES {Math.abs(changeValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm">
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
            <span className="text-muted-foreground text-sm ml-1">
              {hoverDate || activeTimeframe}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onMouseMove={(e: any) => {
                if (e.activePayload?.[0]) {
                  setHoverValue(e.activePayload[0].value);
                  setHoverDate(e.activePayload[0].payload.date);
                }
              }}
              onMouseLeave={() => {
                setHoverValue(null);
                setHoverDate(null);
              }}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={lineColor} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                hide 
              />
              <YAxis 
                hide 
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip 
                content={() => null}
                cursor={{
                  stroke: 'hsl(var(--muted-foreground))',
                  strokeWidth: 1,
                  strokeDasharray: '4 4'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: lineColor,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-between mt-4 border-t border-border pt-4">
          {timeframes.map((tf) => (
            <Button
              key={tf.label}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTimeframe(tf.label)}
              className={`text-xs px-3 py-1.5 h-auto font-medium transition-all ${
                activeTimeframe === tf.label
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
