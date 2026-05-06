import { useState, useMemo, useCallback } from "react";
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
  mode?: "value" | "performance";
}

const timeframes = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 730 },
];

// lightweight haptic helper
const haptic = (() => {
  let last = 0;
  return (ms = 8) => {
    const now = Date.now();
    if (now - last < 40) return; // throttle
    last = now;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(ms); } catch {}
    }
  };
})();

export function RobinhoodPerformanceChart({
  currentValue,
  initialValue,
  portfolioData,
  mode = "value",
}: RobinhoodPerformanceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const generateData = (days: number, current: number, initial: number): PerformanceData[] => {
    const data: PerformanceData[] = [];
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const startValue = initial;
    const endValue = current;
    const volatility = mode === "performance" ? 0.015 : 0.02;

    const points = days <= 1 ? 78
                 : days <= 7 ? days * 4
                 : days <= 30 ? days
                 : days <= 90 ? Math.ceil(days / 2)
                 : Math.ceil(days / 7);

    let prevValue = startValue;
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const baseValue = startValue + (endValue - startValue) * progress;
      const randomWalk = (Math.random() - 0.5) * volatility * Math.max(Math.abs(baseValue), 1);
      const smoothing = 0.7;
      const value = prevValue * smoothing + (baseValue + randomWalk) * (1 - smoothing);
      prevValue = value;

      const timestamp = now - (points - 1 - i) * (days * msPerDay / points);
      const date = new Date(timestamp);
      let dateStr: string;
      if (days <= 1) dateStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      else if (days <= 7) dateStr = date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
      else if (days <= 30) dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else dateStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      data.push({ date: dateStr, value, timestamp });
    }
    return data;
  };

  const selectedTimeframe = timeframes.find(t => t.label === activeTimeframe)!;
  const chartData = useMemo(
    () => portfolioData || generateData(selectedTimeframe.days, currentValue, initialValue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTimeframe, currentValue, initialValue, portfolioData, mode]
  );

  const displayValue = hoverValue ?? currentValue;
  const startValue = chartData[0]?.value ?? initialValue;
  const changeValue = displayValue - startValue;
  const changePercent = mode === "performance"
    ? displayValue - startValue
    : (startValue !== 0 ? (changeValue / Math.abs(startValue)) * 100 : 0);
  const isPositive = (mode === "performance" ? displayValue : changeValue) >= 0;

  const gradientId = `perfGrad-${activeTimeframe}-${mode}`;
  const lineColor = isPositive ? 'hsl(var(--bull))' : 'hsl(var(--bear))';

  const handleMove = useCallback((e: any) => {
    if (e?.activePayload?.[0]) {
      const v = e.activePayload[0].value;
      setHoverValue(prev => {
        if (prev !== v) haptic(6);
        return v;
      });
      setHoverDate(e.activePayload[0].payload.date);
    }
  }, []);

  const formatHero = (v: number) => {
    if (mode === "performance") {
      return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
    }
    return `KES ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="card-gradient overflow-hidden">
      <CardContent className="p-4">
        {/* Hero */}
        <div className="mb-3">
          <div className="text-xl font-bold tracking-tight tabular-nums">
            {formatHero(displayValue)}
          </div>
          <div className={`flex items-center gap-1 mt-0.5 text-[11px] ${isPositive ? 'text-bull' : 'text-bear'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {mode === "value" ? (
              <>
                <span className="font-semibold">
                  {isPositive ? '+' : ''}KES {Math.abs(changeValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="opacity-80">({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
              </>
            ) : (
              <span className="font-semibold">
                {isPositive ? '+' : ''}{(displayValue - startValue).toFixed(2)}% vs start
              </span>
            )}
            <span className="text-muted-foreground ml-1">{hoverDate || activeTimeframe}</span>
          </div>
        </div>

        {/* Chart */}
        <div
          className="h-[170px] -mx-4 touch-none select-none"
          onTouchStart={() => haptic(10)}
          onTouchMove={() => haptic(4)}
          onTouchEnd={() => { setHoverValue(null); setHoverDate(null); }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onMouseMove={handleMove}
              onMouseLeave={() => { setHoverValue(null); setHoverDate(null); }}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={lineColor} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Tooltip content={() => null} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: lineColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe */}
        <div className="flex justify-between mt-3 border-t border-border pt-3">
          {timeframes.map((tf) => (
            <Button
              key={tf.label}
              variant="ghost"
              size="sm"
              onClick={() => { setActiveTimeframe(tf.label); haptic(5); }}
              className={`text-[11px] px-2.5 py-1 h-auto font-semibold transition-all ${
                activeTimeframe === tf.label ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
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
