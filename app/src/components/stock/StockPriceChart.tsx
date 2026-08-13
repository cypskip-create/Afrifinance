import {
  AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell
} from "recharts";
import { useMemo, useCallback, useState } from "react";

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
  // changePercent/isUp are computed relative to the start of the SELECTED timeframe
  // (i.e. the first point on screen), not relative to some fixed "today" price. This
  // lets the caller show gain/loss for whichever period the user is scrubbing through.
  onHoverPrice?: (price: number | null, date: string | null, changePercent?: number | null, isUp?: boolean | null) => void;
  /** Real AfriFinance Data Layer candle data (app/src/hooks/useHistoricalCandles.tsx),
   *  pre-shaped to match generateMockData's output. When omitted (or empty), the
   *  chart falls back to its own generated series — this keeps the component
   *  usable standalone while letting callers supply real data when they have it. */
  data?: ReturnType<typeof generateMockData>;
}

export const generateMockData = (timeframe: string, symbol: string = "STK") => {
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

export const StockPriceChart = ({ symbol = "STK", timeframe, chartType = "area", onHoverPrice, data: liveData }: StockPriceChartProps) => {
  const mockData = useMemo(() => generateMockData(timeframe, symbol), [timeframe, symbol]);
  const data = liveData && liveData.length > 1 ? liveData : mockData;
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const minPrice = Math.min(...data.map(d => d.low ?? d.price));
  const maxPrice = Math.max(...data.map(d => d.high ?? d.price));
  const padding = (maxPrice - minPrice) * 0.15;
  const gradientId = `gs-${symbol}-${timeframe}`;

  // Crosshair overlay position. Recharts v3 no longer hands mouse/touch handlers an
  // `activePayload` — it hands them a small { activeIndex, activeCoordinate, ... } state
  // object as the FIRST argument (the raw DOM event is the second argument). We look up
  // the exact data point from activeIndex, and use activeCoordinate (pixel-relative to the
  // chart) to draw our own crosshair lines + dot on an overlay above the chart. This same
  // handler is wired to both onMouseMove (desktop) and onTouchMove (mobile drag) — v3
  // requires touch to be wired explicitly, it is no longer inferred from onMouseMove.
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

  const updateFromChartState = useCallback((state: any) => {
    const idx = state?.activeIndex != null ? Number(state.activeIndex) : NaN;
    const coord = state?.activeCoordinate;
    if (Number.isFinite(idx) && data[idx] && coord) {
      const point = data[idx];
      setCrosshair({ x: coord.x, y: coord.y });
      // Change is always relative to the first point of the currently selected
      // timeframe, so scrubbing a 1M chart shows gain/loss vs. a month ago, not vs. today.
      const pointChangePercent = firstPrice ? ((point.price - firstPrice) / firstPrice) * 100 : 0;
      const pointIsUp = point.price >= firstPrice;
      onHoverPrice?.(point.price, point.date, pointChangePercent, pointIsUp);
      chartHaptic();
    }
  }, [data, onHoverPrice, firstPrice]);

  const handleLeave = useCallback(() => {
    setCrosshair(null);
    onHoverPrice?.(null, null, null, null);
  }, [onHoverPrice]);

  const domain: [number, number] = [minPrice - padding, maxPrice + padding];

  const renderCrosshair = () => {
    if (!crosshair) return null;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: crosshair.x }} />
        <div className="absolute left-0 right-0 border-t border-dashed border-foreground/30" style={{ top: crosshair.y }} />
        <div
          className="absolute h-2.5 w-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 ring-2 ring-background"
          style={{ left: crosshair.x, top: crosshair.y, backgroundColor: lineColor }}
        />
      </div>
    );
  };

  if (chartType === "candle") {
    const barSize = data.length > 120 ? 2 : data.length > 60 ? 4 : 7;
    return (
      <div className="relative h-full w-full touch-none" onTouchEnd={handleLeave}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={updateFromChartState}
            onMouseLeave={handleLeave}
            onTouchMove={updateFromChartState}
          >
            <XAxis dataKey="date" hide />
            <YAxis hide domain={domain} />
            <Tooltip content={() => null} cursor={false} />
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
        {renderCrosshair()}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full touch-none" onTouchEnd={handleLeave}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          onMouseMove={updateFromChartState}
          onMouseLeave={handleLeave}
          onTouchMove={updateFromChartState}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.14} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={domain} />
          <Tooltip content={() => null} cursor={false} />
          <ReferenceLine y={firstPrice} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.35} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={1.6}
            fill={chartType === "area" ? `url(#${gradientId})` : "transparent"}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {renderCrosshair()}
    </div>
  );
};