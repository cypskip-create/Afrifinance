import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine, ComposedChart, Bar
} from "recharts";
import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface StockPriceChartProps {
  symbol?: string;
  timeframe: string;
  onHoverPrice?: (price: number | null, date: string | null) => void;
}

const generateMockData = (timeframe: string, symbol: string = "STK") => {
  // Seeded for stable per-symbol curves
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
  const rand = (() => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();

  const dataPoints: any[] = [];
  const basePrice = 100 + (seed % 200);
  let points = 60;
  switch (timeframe) {
    case "1D": points = 78; break;
    case "5D": case "1W": points = 35; break;
    case "1M": points = 22; break;
    case "3M": points = 65; break;
    case "6M": points = 130; break;
    case "YTD": points = 180; break;
    case "1Y": points = 252; break;
    case "5Y": points = 260; break;
    case "ALL": points = 400; break;
  }

  let currentPrice = basePrice;
  const prices: number[] = [];
  for (let i = 0; i < points; i++) {
    const date = new Date();
    if (timeframe === "1D") date.setMinutes(date.getMinutes() - (points - i) * 5);
    else if (timeframe === "5Y" || timeframe === "ALL") date.setDate(date.getDate() - (points - i) * 7);
    else date.setDate(date.getDate() - (points - i));

    const momentum = rand() > 0.48 ? 1 : -1;
    const volatility = timeframe === "1D" ? basePrice * 0.003 : basePrice * 0.012;
    currentPrice = Math.max(basePrice * 0.6, Math.min(basePrice * 1.6, currentPrice + momentum * rand() * volatility));
    prices.push(currentPrice);

    const sma20 = i >= 19 ? prices.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20 : undefined;
    const sma50 = i >= 49 ? prices.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50 : undefined;
    let bb_upper, bb_lower;
    if (sma20 && i >= 19) {
      const slice = prices.slice(i - 19, i + 1);
      const std = Math.sqrt(slice.reduce((s, p) => s + (p - sma20) ** 2, 0) / 20);
      bb_upper = sma20 + 2 * std; bb_lower = sma20 - 2 * std;
    }

    let formattedDate = "";
    if (timeframe === "1D") formattedDate = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    else if (["1W", "5D"].includes(timeframe)) formattedDate = date.toLocaleDateString("en-US", { weekday: "short" });
    else if (["1M", "3M", "6M", "YTD"].includes(timeframe)) formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    else formattedDate = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    dataPoints.push({
      date: formattedDate,
      price: +currentPrice.toFixed(2),
      volume: Math.floor(rand() * 1_000_000) + 500_000,
      timestamp: date.getTime(),
      sma20, sma50, bb_upper, bb_lower,
      rsi: 30 + rand() * 40,
    });
  }
  return dataPoints;
};

// TradingView-style floating tooltip: black pill with price + date
const TVTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-foreground/95 text-background rounded-md px-2.5 py-1 shadow-lg text-center backdrop-blur-sm border border-foreground/10">
        <p className="font-bold text-[13px] tabular-nums leading-tight">KES {d.price.toFixed(2)}</p>
        <p className="text-[10px] opacity-80 leading-tight">{d.date}</p>
      </div>
    );
  }
  return null;
};

// Custom right-side last-price pill, rendered via Recharts label.
const LastPriceLabel = ({ viewBox, value, color }: any) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const text = value.toFixed(2);
  const w = Math.max(46, text.length * 8 + 12);
  return (
    <g transform={`translate(${x - w}, ${y - 9})`}>
      <rect width={w} height={18} rx={3} fill={color} />
      <text x={w / 2} y={13} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" className="tabular-nums">
        {text}
      </text>
    </g>
  );
};

export const StockPriceChart = ({ symbol = "STK", timeframe, onHoverPrice }: StockPriceChartProps) => {
  const [advanced, setAdvanced] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const data = useMemo(() => generateMockData(timeframe, symbol), [timeframe, symbol]);
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.15;

  const handleMouseMove = useCallback((e: any) => {
    if (e?.activePayload?.[0] && onHoverPrice) onHoverPrice(e.activePayload[0].payload.price, e.activePayload[0].payload.date);
  }, [onHoverPrice]);
  const handleMouseLeave = useCallback(() => { if (onHoverPrice) onHoverPrice(null, null); }, [onHoverPrice]);

  // ── TradingView-style simple line ──
  if (!advanced) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] rounded-full font-semibold gap-1 text-muted-foreground"
            onClick={() => setShowGrid(!showGrid)}
          >
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] rounded-full font-semibold gap-1"
            onClick={() => setAdvanced(true)}
          >
            <Activity className="h-3 w-3" />Advanced
          </Button>
        </div>

        <div className="h-full w-full" style={{ minHeight: 240 }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 56, left: 0, bottom: 18 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {showGrid && (
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.35}
                  strokeDasharray="0"
                  vertical={true}
                  horizontal={true}
                />
              )}
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                minTickGap={48}
              />
              <YAxis
                orientation="right"
                domain={[minPrice - padding, maxPrice + padding]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={50}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                content={<TVTooltip />}
                cursor={{
                  stroke: "hsl(var(--foreground))",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                  strokeOpacity: 0.5,
                }}
              />
              <ReferenceLine
                y={lastPrice}
                stroke={lineColor}
                strokeWidth={1}
                strokeDasharray="2 4"
                label={<LastPriceLabel value={lastPrice} color={lineColor} />}
              />
              <Line
                type="linear"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={1.6}
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ── Advanced mode (indicators) ──
  const gradientId = `colorPrice-${symbol}-${timeframe}-adv`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={showVolume ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowVolume(!showVolume)}>Vol</Badge>
          <Badge variant={showSMA20 ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowSMA20(!showSMA20)}>SMA20</Badge>
          <Badge variant={showSMA50 ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowSMA50(!showSMA50)}>SMA50</Badge>
          <Badge variant={showBB ? "default" : "outline"} className="text-[10px] cursor-pointer h-5" onClick={() => setShowBB(!showBB)}>BB</Badge>
        </div>
        <Button variant="default" size="sm" className="h-7 text-[10px] rounded-full font-semibold gap-1" onClick={() => setAdvanced(false)}>Simple</Button>
      </div>

      <div style={{ minHeight: 240 }}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 56, left: 0, bottom: 18 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.35} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} minTickGap={48} />
            <YAxis yAxisId="price" orientation="right" domain={[minPrice - padding, maxPrice + padding]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={50} tickFormatter={(v) => v.toFixed(2)} />
            <YAxis yAxisId="volume" hide orientation="left" />
            <Tooltip content={<TVTooltip />} cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.5 }} />

            {showVolume && <Bar dataKey="volume" yAxisId="volume" fill="hsl(var(--muted))" opacity={0.35} barSize={2} />}
            {showBB && (
              <>
                <Line type="monotone" dataKey="bb_upper" yAxisId="price" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="bb_lower" yAxisId="price" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </>
            )}

            <Area type="linear" dataKey="price" yAxisId="price" stroke={lineColor} strokeWidth={1.6} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />

            {showSMA20 && <Line type="monotone" dataKey="sma20" yAxisId="price" stroke="#3b82f6" strokeWidth={1.2} dot={false} />}
            {showSMA50 && <Line type="monotone" dataKey="sma50" yAxisId="price" stroke="#f97316" strokeWidth={1.2} dot={false} />}

            <ReferenceLine y={lastPrice} yAxisId="price" stroke={lineColor} strokeWidth={1} strokeDasharray="2 4" label={<LastPriceLabel value={lastPrice} color={lineColor} />} />
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
    </div>
  );
};
