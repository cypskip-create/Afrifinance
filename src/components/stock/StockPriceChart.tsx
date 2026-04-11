import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ComposedChart, Bar, Line, ReferenceLine } from "recharts";
import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface StockPriceChartProps {
  symbol?: string;
  timeframe: string;
  onHoverPrice?: (price: number | null, date: string | null) => void;
}

const generateMockData = (timeframe: string) => {
  const dataPoints: { date: string; price: number; volume: number; timestamp: number; sma20?: number; sma50?: number; bb_upper?: number; bb_lower?: number; rsi?: number; macd?: number; signal_line?: number }[] = [];
  const basePrice = 150;
  let points = 30;

  switch (timeframe) {
    case "1D": points = 78; break;
    case "5D": case "1W": points = 35; break;
    case "1M": points = 22; break;
    case "3M": case "6M": points = 65; break;
    case "1Y": points = 252; break;
    case "ALL": case "5Y": points = 1260; break;
  }

  let currentPrice = basePrice;
  const prices: number[] = [];
  
  for (let i = 0; i < points; i++) {
    const date = new Date();
    if (timeframe === "1D") {
      date.setMinutes(date.getMinutes() - (points - i) * 5);
    } else {
      date.setDate(date.getDate() - (points - i));
    }
    
    const momentum = Math.random() > 0.48 ? 1 : -1;
    const volatility = timeframe === "1D" ? 0.3 : 0.8;
    const change = momentum * Math.random() * volatility;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.5, currentPrice + change));
    prices.push(currentPrice);

    const sma20 = i >= 19 ? prices.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20 : undefined;
    const sma50 = i >= 49 ? prices.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50 : undefined;
    
    let bb_upper, bb_lower;
    if (sma20 && i >= 19) {
      const slice = prices.slice(i - 19, i + 1);
      const std = Math.sqrt(slice.reduce((sum, p) => sum + Math.pow(p - sma20, 2), 0) / 20);
      bb_upper = sma20 + 2 * std;
      bb_lower = sma20 - 2 * std;
    }
    
    const rsi = 30 + Math.random() * 40;
    const macd = (Math.random() - 0.5) * 2;
    const signal_line = macd + (Math.random() - 0.5) * 0.5;

    let formattedDate = "";
    if (timeframe === "1D") formattedDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    else if (["1W", "5D"].includes(timeframe)) formattedDate = date.toLocaleDateString('en-US', { weekday: 'short' });
    else if (["1M", "3M", "6M"].includes(timeframe)) formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    else formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    dataPoints.push({ date: formattedDate, price: parseFloat(currentPrice.toFixed(2)), volume: Math.floor(Math.random() * 1000000) + 500000, timestamp: date.getTime(), sma20, sma50, bb_upper, bb_lower, rsi, macd, signal_line });
  }
  return dataPoints;
};

const CrosshairTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-foreground text-background rounded-lg px-3 py-1.5 shadow-xl text-center">
        <p className="font-bold text-sm">KES {data.price.toFixed(2)}</p>
        <p className="text-[10px] opacity-80">{data.date}</p>
      </div>
    );
  }
  return null;
};

export const StockPriceChart = ({ symbol, timeframe, onHoverPrice }: StockPriceChartProps) => {
  const [advanced, setAdvanced] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  const data = useMemo(() => generateMockData(timeframe), [timeframe]);
  
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const strokeColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const gradientId = `colorPrice-${symbol}-${timeframe}-${advanced}`;
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  const handleMouseMove = useCallback((e: any) => {
    if (e?.activePayload?.[0] && onHoverPrice) {
      onHoverPrice(e.activePayload[0].payload.price, e.activePayload[0].payload.date);
    }
  }, [onHoverPrice]);

  const handleMouseLeave = useCallback(() => {
    if (onHoverPrice) onHoverPrice(null, null);
  }, [onHoverPrice]);

  if (!advanced) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-[10px] rounded-full font-semibold gap-1"
            onClick={() => setAdvanced(true)}
          >
            <Activity className="h-3 w-3" />
            Advanced
          </Button>
        </div>
        <div className="h-full w-full" style={{ minHeight: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[minPrice - padding, maxPrice + padding]} />
              <Tooltip
                content={<CrosshairTooltip />}
                cursor={{
                  stroke: 'hsl(var(--foreground))',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 5, fill: strokeColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={showVolume ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowVolume(!showVolume)}>Vol</Badge>
          <Badge variant={showSMA20 ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowSMA20(!showSMA20)}>SMA20</Badge>
          <Badge variant={showSMA50 ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowSMA50(!showSMA50)}>SMA50</Badge>
          <Badge variant={showBB ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowBB(!showBB)}>BB</Badge>
          <Badge variant={showRSI ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowRSI(!showRSI)}>RSI</Badge>
        </div>
        <Button variant="default" size="sm" className="h-7 text-[10px] rounded-full font-semibold gap-1" onClick={() => setAdvanced(false)}>
          Simple
        </Button>
      </div>

      <div style={{ minHeight: showRSI ? 280 : 220 }}>
        <ResponsiveContainer width="100%" height={showRSI ? 280 : 220}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[minPrice - padding, maxPrice + padding]} yAxisId="price" />
            <YAxis hide orientation="right" yAxisId="volume" />
            <Tooltip
              content={<CrosshairTooltip />}
              cursor={{
                stroke: 'hsl(var(--foreground))',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            
            {showVolume && <Bar dataKey="volume" yAxisId="volume" fill="hsl(var(--muted))" opacity={0.3} barSize={2} />}
            
            {showBB && (
              <>
                <Area type="monotone" dataKey="bb_upper" yAxisId="price" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" fill="transparent" dot={false} />
                <Area type="monotone" dataKey="bb_lower" yAxisId="price" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" fill="transparent" dot={false} />
              </>
            )}
            
            <Area type="monotone" dataKey="price" yAxisId="price" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 5, fill: strokeColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
            
            {showSMA20 && <Line type="monotone" dataKey="sma20" yAxisId="price" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" dot={false} />}
            {showSMA50 && <Line type="monotone" dataKey="sma50" yAxisId="price" stroke="#f97316" strokeWidth={1} strokeDasharray="4 4" dot={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Open</p>
          <p className="text-xs font-medium">KES {firstPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">High</p>
          <p className="text-xs font-medium">KES {maxPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Low</p>
          <p className="text-xs font-medium">KES {minPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Signal</p>
          <Badge variant={isPositive ? "default" : "destructive"} className="text-[10px] px-1">
            {isPositive ? "Buy" : "Sell"}
          </Badge>
        </div>
      </div>

      {showRSI && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1">RSI (14): {data[data.length - 1]?.rsi?.toFixed(1)}</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${data[data.length - 1]?.rsi || 50}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
