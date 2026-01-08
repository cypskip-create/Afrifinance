import { Card, CardContent } from "@/components/ui/card";
import { Gauge, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface FearGreedData {
  value: number;
  label: string;
  previousValue: number;
  weekAgo: number;
  monthAgo: number;
}

export function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData>({
    value: 62,
    label: 'Greed',
    previousValue: 58,
    weekAgo: 45,
    monthAgo: 38,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const change = (Math.random() - 0.5) * 4;
        const newValue = Math.max(0, Math.min(100, prev.value + change));
        return {
          ...prev,
          value: Math.round(newValue),
          label: getLabel(newValue),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLabel = (value: number): string => {
    if (value <= 20) return 'Extreme Fear';
    if (value <= 40) return 'Fear';
    if (value <= 60) return 'Neutral';
    if (value <= 80) return 'Greed';
    return 'Extreme Greed';
  };

  const getColor = (value: number): string => {
    if (value <= 20) return 'text-bear';
    if (value <= 40) return 'text-orange-500';
    if (value <= 60) return 'text-amber-500';
    if (value <= 80) return 'text-lime-500';
    return 'text-bull';
  };

  const getGradient = (value: number): string => {
    if (value <= 20) return 'from-bear to-bear/60';
    if (value <= 40) return 'from-orange-500 to-orange-500/60';
    if (value <= 60) return 'from-amber-500 to-amber-500/60';
    if (value <= 80) return 'from-lime-500 to-lime-500/60';
    return 'from-bull to-bull/60';
  };

  const change = data.value - data.previousValue;

  return (
    <Card className="card-gradient overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Gauge className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Fear & Greed Index</h3>
              <p className="text-xs text-muted-foreground">Market sentiment</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>

        {/* Main Gauge Display */}
        <div className="relative flex flex-col items-center py-4">
          {/* Circular gauge background */}
          <div className="relative w-36 h-20 overflow-hidden">
            {/* Background arc */}
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="w-36 h-36 rounded-full border-[12px] border-muted -mb-[72px]" />
            </div>
            {/* Colored arc */}
            <div 
              className="absolute inset-0 flex items-end justify-center"
              style={{
                clipPath: `polygon(0 100%, ${data.value}% 100%, ${data.value}% 0, 0 0)`,
              }}
            >
              <div className={`w-36 h-36 rounded-full border-[12px] border-transparent bg-gradient-to-r ${getGradient(data.value)} -mb-[72px]`} 
                style={{ 
                  borderTopColor: 'currentColor',
                  borderLeftColor: 'currentColor',
                }}
              />
            </div>
          </div>
          
          {/* Value display */}
          <div className="text-center -mt-2">
            <div className={`text-4xl font-bold ${getColor(data.value)} transition-colors`}>
              {data.value}
            </div>
            <div className={`text-sm font-semibold ${getColor(data.value)}`}>
              {data.label}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {change > 0 ? (
                <TrendingUp className="h-3 w-3 text-bull" />
              ) : change < 0 ? (
                <TrendingDown className="h-3 w-3 text-bear" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={`text-xs ${change > 0 ? 'text-bull' : change < 0 ? 'text-bear' : 'text-muted-foreground'}`}>
                {change > 0 ? '+' : ''}{change} from yesterday
              </span>
            </div>
          </div>
        </div>

        {/* Historical comparison */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Yesterday</p>
            <p className="text-sm font-semibold">{data.previousValue}</p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-xs text-muted-foreground">Week Ago</p>
            <p className="text-sm font-semibold">{data.weekAgo}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Month Ago</p>
            <p className="text-sm font-semibold">{data.monthAgo}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between text-xs mt-4 pt-3 border-t border-border/50">
          <span className="text-bear">Extreme Fear</span>
          <span className="text-orange-500">Fear</span>
          <span className="text-amber-500">Neutral</span>
          <span className="text-lime-500">Greed</span>
          <span className="text-bull">Extreme</span>
        </div>
      </CardContent>
    </Card>
  );
}
