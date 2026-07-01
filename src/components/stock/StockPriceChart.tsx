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

const HoverTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-foreground text-background rounded-md px-2 py-1 shadow-lg text-center">
        <p className="font-bold text-[12px] tabular leading-tight">KES {d.price.toFixed(2)}</p>
        <p className="text-[9px] opacity-80 leading-tight mt-0.5">{d.date}</p>
      </div>
    );
  }
  return null;
};

export const StockPriceChart = ({ symbol = "STK", timeframe, onHoverPrice }: StockPriceChartProps) => {
  const [advanced, setAdvanced] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBB, setShowBB] = useState(false);

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

  // ── Simple (Robinhood-style) line — no side price axis ──
  if (!advanced) {
    const gradientId = `gs-${symbol}-${timeframe}`;
    return (
      <div className="relative h-full w-full">
        <button
          data-small-target
          className="absolute top-1 right-1 z-10 h-6 px-2 text-[9.5px] rounded-full font-semibold gap-1 inline-flex items-center bg-background/70 backdrop-blur border border-border/70 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setAdvanced(true)}
        >
          <Activity className="h-2.5 w-2.5" />Advanced
        </button>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 4, left: 4, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.14} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[minPrice - padding, maxPrice + padding]} />
            <Tooltip
              content={<HoverTooltip />}
              cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1, strokeOpacity: 0.35 }}
            />
            <ReferenceLine y={firstPrice} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.4} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={1.6}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3.5, fill: lineColor, stroke: "hsl(var(--background))", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Advanced (keeps the axes for serious analysis) ──
  const gradientId = `colorPrice-${symbol}-${timeframe}-adv`;
  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1 left-1 right-1 z-10 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={showVolume ? "default" : "outline"} className="text-[9px] cursor-pointer h-5 bg-background/80 backdrop-blur-sm" onClick={() => setShowVolume(!showVolume)}>Vol</Badge>
          <Badge variant={showSMA20 ? "default" : "outline"} className="text-[9px] cursor-pointer h-5 bg-background/80 backdrop-blur-sm" onClick={() => setShowSMA20(!showSMA20)}>SMA20</Badge>
          <Badge variant={showSMA50 ? "default" : "outline"} className="text-[9px] cursor-pointer h-5 bg-background/80 backdrop-blur-sm" onClick={() => setShowSMA50(!showSMA50)}>SMA50</Badge>
          <Badge variant={showBB ? "default" : "outline"} className="text-[9px] cursor-pointer h-5 bg-background/80 backdrop-blur-sm" onClick={() => setShowBB(!showBB)}>BB</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9.5px] rounded-full font-semibold bg-background/70 border border-border/70" onClick={() => setAdvanced(false)}>Simple</Button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 28, right: 4, left: 0, bottom: 4 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.18} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} minTickGap={48} />
          <YAxis yAxisId="price" orientation="right" domain={[minPrice - padding, maxPrice + padding]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={44} tickFormatter={(v) => v.toFixed(2)} />
          <YAxis yAxisId="volume" hide orientation="left" />
          <Tooltip content={<HoverTooltip />} cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.5 }} />

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

          <ReferenceLine y={lastPrice} yAxisId="price" stroke={lineColor} strokeWidth={1} strokeDasharray="2 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
