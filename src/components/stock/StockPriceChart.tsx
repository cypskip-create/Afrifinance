import {
  AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell
} from "recharts";
import { useMemo, useCallback } from "react";

let lastHaptic = 0;
const chartHaptic = () => {
  const now = Date.now();
  if (now - lastHaptic < 45) return;
  lastHaptic = now;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(5);
};

export type ChartType = "line" | "area" | "candle";

interface StockPriceChartProps {
  symbol?: string;
  timeframe: string;
  chartType?: ChartType;
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
  for (let i = 0; i < points; i++) {
    const date = new Date();
    if (timeframe === "1D") date.setMinutes(date.getMinutes() - (points - i) * 5);
    else if (timeframe === "5Y" || timeframe === "ALL") date.setDate(date.getDate() - (points - i) * 7);
    else date.setDate(date.getDate() - (points - i));

    const momentum = rand() > 0.48 ? 1 : -1;
    const volatility = timeframe === "1D" ? basePrice * 0.003 : basePrice * 0.012;
    const open = currentPrice;
    currentPrice = Math.max(basePrice * 0.6, Math.min(basePrice * 1.6, currentPrice + momentum * rand() * volatility));
    const close = currentPrice;
    const wick = volatility * (0.4 + rand());
    const high = Math.max(open, close) + wick * rand();
    const low = Math.min(open, close) - wick * rand();

    let formattedDate = "";
    if (timeframe === "1D") formattedDate = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    else if (["1W", "5D"].includes(timeframe)) formattedDate = date.toLocaleDateString("en-US", { weekday: "short" });
    else if (["1M", "3M", "6M", "YTD"].includes(timeframe)) formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    else formattedDate = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    dataPoints.push({
      date: formattedDate,
      price: +close.toFixed(2),
      open: +open.toFixed(2),
      close: +close.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      // candle body plotted as a floating bar [min, max]
      body: [+Math.min(open, close).toFixed(2), +Math.max(open, close).toFixed(2)],
      wickRange: [+low.toFixed(2), +high.toFixed(2)],
      up: close >= open,
      timestamp: date.getTime(),
    });
  }
  return dataPoints;
};

export const StockPriceChart = ({ symbol = "STK", timeframe, chartType = "area", onHoverPrice }: StockPriceChartProps) => {
  const data = useMemo(() => generateMockData(timeframe, symbol), [timeframe, symbol]);
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const minPrice = Math.min(...data.map(d => d.low ?? d.price));
  const maxPrice = Math.max(...data.map(d => d.high ?? d.price));
  const padding = (maxPrice - minPrice) * 0.15;
  const gradientId = `gs-${symbol}-${timeframe}`;

  const handleMouseMove = useCallback((e: any) => {
    if (e?.activePayload?.[0] && onHoverPrice) {
      const p = e.activePayload[0].payload;
      onHoverPrice(p.price, p.date);
      chartHaptic();
    }
  }, [onHoverPrice]);
  const handleMouseLeave = useCallback(() => { if (onHoverPrice) onHoverPrice(null, null); }, [onHoverPrice]);

  const domain: [number, number] = [minPrice - padding, maxPrice + padding];
  const cursor = { stroke: "hsl(var(--foreground))", strokeWidth: 1, strokeOpacity: 0.35 };

  if (chartType === "candle") {
    const barSize = data.length > 120 ? 2 : data.length > 60 ? 4 : 7;
    return (
      <div className="relative h-full w-full touch-none" onTouchEnd={handleMouseLeave}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <XAxis dataKey="date" hide />
            <YAxis hide domain={domain} />
            <Tooltip content={() => null} cursor={cursor} />
            <Bar dataKey="wickRange" barSize={1} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.up ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
              ))}
            </Bar>
            <Bar dataKey="body" barSize={barSize} isAnimationActive={false} minPointSize={1}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.up ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full touch-none" onTouchEnd={handleMouseLeave}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
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
          <YAxis hide domain={domain} />
          <Tooltip content={() => null} cursor={cursor} />
          <ReferenceLine y={firstPrice} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.35} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={1.6}
            fill={chartType === "area" ? `url(#${gradientId})` : "transparent"}
            dot={false}
            activeDot={{ r: 3.5, fill: lineColor, stroke: "hsl(var(--background))", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
