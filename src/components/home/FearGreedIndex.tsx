import { Card, CardContent } from "@/components/ui/card";
import { Gauge, TrendingUp, TrendingDown, Minus, Info, Activity, BarChart3, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface FearGreedData {
  value: number;
  label: string;
  previousValue: number;
  weekAgo: number;
  monthAgo: number;
}

interface SentimentFactor {
  name: string;
  value: number;
  icon: React.ReactNode;
  weight: string;
}

const historicalData = [
  { date: 'Jan', value: 25 },
  { date: 'Feb', value: 35 },
  { date: 'Mar', value: 42 },
  { date: 'Apr', value: 38 },
  { date: 'May', value: 55 },
  { date: 'Jun', value: 48 },
  { date: 'Jul', value: 62 },
  { date: 'Aug', value: 58 },
  { date: 'Sep', value: 45 },
  { date: 'Oct', value: 52 },
  { date: 'Nov', value: 68 },
  { date: 'Dec', value: 62 },
];

export function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData>({
    value: 62,
    label: 'Greed',
    previousValue: 58,
    weekAgo: 45,
    monthAgo: 38,
  });

  const [showDetails, setShowDetails] = useState(false);

  const sentimentFactors: SentimentFactor[] = [
    { name: 'Market Momentum', value: 72, icon: <TrendingUp className="h-3 w-3" />, weight: '25%' },
    { name: 'Stock Strength', value: 65, icon: <BarChart3 className="h-3 w-3" />, weight: '25%' },
    { name: 'Trading Volume', value: 58, icon: <Activity className="h-3 w-3" />, weight: '25%' },
    { name: 'Social Sentiment', value: 55, icon: <Users className="h-3 w-3" />, weight: '25%' },
  ];

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
    if (value <= 20) return 'text-red-500';
    if (value <= 40) return 'text-orange-500';
    if (value <= 60) return 'text-amber-500';
    if (value <= 80) return 'text-lime-500';
    return 'text-green-500';
  };

  const getColorClass = (value: number): string => {
    if (value <= 20) return 'bg-red-500';
    if (value <= 40) return 'bg-orange-500';
    if (value <= 60) return 'bg-amber-500';
    if (value <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getGradientColors = (value: number): { start: string; end: string } => {
    if (value <= 20) return { start: '#ef4444', end: '#dc2626' };
    if (value <= 40) return { start: '#f97316', end: '#ea580c' };
    if (value <= 60) return { start: '#f59e0b', end: '#d97706' };
    if (value <= 80) return { start: '#84cc16', end: '#65a30d' };
    return { start: '#22c55e', end: '#16a34a' };
  };

  const change = data.value - data.previousValue;
  const gradientColors = getGradientColors(data.value);

  // Calculate needle rotation (0 = far left at -90deg, 100 = far right at 90deg)
  const needleRotation = (data.value / 100) * 180 - 90;

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
              <p className="text-xs text-muted-foreground">Market sentiment indicator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-green-500" />
              <span>Live</span>
            </div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-primary hover:underline"
            >
              {showDetails ? 'Less' : 'More'}
            </button>
          </div>
        </div>

        {/* Semi-circular Gauge */}
        <div className="relative flex flex-col items-center py-2">
          <div className="relative w-48 h-28">
            {/* Gauge background arc */}
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gradientColors.start} />
                  <stop offset="100%" stopColor={gradientColors.end} />
                </linearGradient>
              </defs>
              
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              
              {/* Filled arc based on value */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(data.value / 100) * 251} 251`}
              />
              
              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((tick, i) => {
                const angle = (tick / 100) * Math.PI;
                const x1 = 100 - Math.cos(angle) * 68;
                const y1 = 100 - Math.sin(angle) * 68;
                const x2 = 100 - Math.cos(angle) * 60;
                const y2 = 100 - Math.sin(angle) * 60;
                return (
                  <line
                    key={tick}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/50"
                  />
                );
              })}
              
              {/* Needle */}
              <g transform={`rotate(${needleRotation}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-foreground transition-transform duration-500"
                />
                <circle cx="100" cy="100" r="6" fill="currentColor" className="text-foreground" />
              </g>
            </svg>
            
            {/* Labels on gauge */}
            <div className="absolute bottom-0 left-2 text-[10px] text-red-500 font-medium">0</div>
            <div className="absolute bottom-0 right-2 text-[10px] text-green-500 font-medium">100</div>
          </div>
          
          {/* Value display */}
          <div className="text-center -mt-4">
            <div className={`text-4xl font-bold ${getColor(data.value)} transition-colors duration-300`}>
              {data.value}
            </div>
            <div className={`text-lg font-semibold ${getColor(data.value)} transition-colors`}>
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

        {/* What it means */}
        <div className="bg-muted/20 rounded-lg p-3 mt-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.value <= 30 
              ? "🔴 Extreme fear may indicate a buying opportunity as investors are overly worried."
              : data.value <= 50 
              ? "🟡 Market sentiment is balanced. Investors are cautious but not panicking."
              : data.value <= 70 
              ? "🟢 Greed is driving the market. Consider taking profits on overvalued positions."
              : "⚠️ Extreme greed - markets may be due for a correction. Proceed with caution."
            }
          </p>
        </div>

        {/* Historical comparison */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Yesterday</p>
            <p className={`text-sm font-semibold ${getColor(data.previousValue)}`}>{data.previousValue}</p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-xs text-muted-foreground">Week Ago</p>
            <p className={`text-sm font-semibold ${getColor(data.weekAgo)}`}>{data.weekAgo}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Month Ago</p>
            <p className={`text-sm font-semibold ${getColor(data.monthAgo)}`}>{data.monthAgo}</p>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
            {/* Sentiment Breakdown */}
            <div>
              <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-primary" />
                Sentiment Breakdown
              </h4>
              <div className="space-y-2">
                {sentimentFactors.map((factor) => (
                  <div key={factor.name} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-28 text-xs text-muted-foreground">
                      {factor.icon}
                      <span className="truncate">{factor.name}</span>
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getColorClass(factor.value)}`}
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-8 text-right ${getColor(factor.value)}`}>
                      {factor.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Chart */}
            <div>
              <h4 className="text-xs font-semibold mb-3">12-Month History</h4>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      width={25}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [value, 'Index']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#historyGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-between text-[10px] mt-4 pt-3 border-t border-border/50">
          <span className="text-red-500 font-medium">Extreme Fear</span>
          <span className="text-orange-500 font-medium">Fear</span>
          <span className="text-amber-500 font-medium">Neutral</span>
          <span className="text-lime-500 font-medium">Greed</span>
          <span className="text-green-500 font-medium">Extreme</span>
        </div>
      </CardContent>
    </Card>
  );
}
