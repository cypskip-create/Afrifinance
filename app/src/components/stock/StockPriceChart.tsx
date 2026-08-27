import {
  AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell, CartesianGrid
} from "recharts";
import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { sma, ema, bollingerBands, rsi, macd, parabolicSAR, kdj, williamsR, cci, DEFAULT_INDICATOR_SETTINGS, type IndicatorSettings } from "@/lib/technicalIndicators";

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
  /** Real Continua Data Layer candle data (app/src/hooks/useHistoricalCandles.tsx),
   *  pre-shaped to match generateMockData's output. When omitted (or empty), the
   *  chart falls back to its own generated series — this keeps the component
   *  usable standalone while letting callers supply real data when they have it. */
  data?: ReturnType<typeof generateMockData>;
  /** Which overlay/sub-panel indicators are switched on (Moomoo-style). Defaults to
   *  everything off — a clean chart until the person turns something on. */
  indicators?: IndicatorSettings;
  /** Fixed height (px) for the main price/candle pane. When set, turning on
   *  Volume/MACD/RSI/etc. never shrinks the main chart -- those panels get
   *  their own fixed height and are appended below, growing the component's
   *  total height instead (Moomoo-style). When omitted, the main pane fills
   *  whatever space its flex parent gives it (used by the fullscreen chart,
   *  which is already viewport-bounded). */
  mainHeight?: number;
  /** Show a real price scale on the right (ticked labels + a highlighted
   *  current-price tag), and let the person drag that scale up/down to
   *  zoom the price axis in/out — TradingView/Moomoo style. Off by default
   *  since the embedded card chart keeps a clean, label-free look. */
  showPriceAxis?: boolean;
  /** Draw faint horizontal gridlines behind the price chart. */
  showGrid?: boolean;
  /** When true, the crosshair stays put after a tap/click instead of
   *  clearing on mouse-leave / touch-end (used by the fullscreen chart's
   *  crosshair tool toggle). */
  pinCrosshair?: boolean;
  /** Enables the trendline draw tool: drag anywhere on the main price pane
   *  to sketch a line. Lines are anchored to real price values and relative
   *  time position (not raw pixels), so they stay put correctly if the
   *  price axis is zoomed or the pane is resized. Lines persist across
   *  drawMode being switched off, and reset when the timeframe/symbol
   *  changes (an annotation from a different window/price range no longer
   *  means anything). */
  drawMode?: boolean;
  /** Bump this (e.g. a counter) to clear every drawn line. */
  clearDrawSignal?: number;
  /** Fires whenever the drawn-line count goes from zero to non-zero or back,
   *  so a caller can show/hide a "clear drawings" affordance. */
  onDrawingsChange?: (hasDrawings: boolean) => void;
}

// Fixed panel heights (px) for Volume and the oscillator sub-panel. These are
// constants, not proportions of the total -- that's the whole point: adding
// a panel adds exactly this many pixels below, and never eats into the main
// chart's own height.
const VOLUME_PANEL_HEIGHT = 56;
const SUB_PANEL_HEIGHT = 84;

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

    // Mock volume, same seeded-rand convention as the rest of this generator —
    // used only when there's no real Data Layer candle (see useHistoricalCandles,
    // which carries the real Mansa-sourced `volume` field for 1W/1M/3M/1Y/ALL).
    // Bigger price moves get a somewhat higher volume figure, like a real tape.
    const moveRatio = Math.abs(close - open) / (volatility || 1);
    const volume = Math.round(150_000 + rand() * 650_000 + moveRatio * 400_000);

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
      volume,
    });
  }
  return dataPoints;
};

export const StockPriceChart = ({ symbol = "STK", timeframe, chartType = "area", onHoverPrice, data: liveData, indicators = DEFAULT_INDICATOR_SETTINGS, mainHeight, showPriceAxis = false, showGrid = false, pinCrosshair = false, drawMode = false, clearDrawSignal, onDrawingsChange }: StockPriceChartProps) => {
  const mockData = useMemo(() => generateMockData(timeframe, symbol), [timeframe, symbol]);
  const data = liveData && liveData.length > 1 ? liveData : mockData;
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const gradientId = `gs-${symbol}-${timeframe}`;

  // Overlay indicators (drawn on the price chart itself) + sub-panel indicator
  // (Volume / MACD / RSI, drawn in their own panel below since they need a
  // different y-scale entirely). Computed once per data/indicator-toggle change.
  const chartData = useMemo(() => {
    const ma5 = sma(data, 5), ma20 = sma(data, 20), ma50 = sma(data, 50);
    const ema12 = ema(data, 12), ema26 = ema(data, 26);
    const boll = bollingerBands(data, 20, 2);
    const rsiVals = rsi(data, 14);
    const { macdLine, signal, histogram } = macd(data, 12, 26, 9);
    const sar = parabolicSAR(data);
    const { k: kdjK, d: kdjD, j: kdjJ } = kdj(data);
    const wr = williamsR(data);
    const cciVals = cci(data);
    return data.map((d, i) => ({
      ...d,
      ma5: ma5[i], ma20: ma20[i], ma50: ma50[i],
      ema12: ema12[i], ema26: ema26[i],
      bollUpper: boll[i].upper, bollMid: boll[i].mid, bollLower: boll[i].lower,
      rsi: rsiVals[i],
      macdLine: macdLine[i], macdSignal: signal[i], macdHist: histogram[i],
      sar: sar[i],
      kdjK: kdjK[i], kdjD: kdjD[i], kdjJ: kdjJ[i],
      wr: wr[i],
      cci: cciVals[i],
      volume: d.volume ?? 0,
    }));
  }, [data]);

  const minPrice = Math.min(
    ...data.map(d => d.low ?? d.price),
    ...(indicators.overlays.boll ? chartData.map(d => d.bollLower ?? Infinity).filter(Number.isFinite) : []),
  );
  const maxPrice = Math.max(
    ...data.map(d => d.high ?? d.price),
    ...(indicators.overlays.boll ? chartData.map(d => d.bollUpper ?? -Infinity).filter(Number.isFinite) : []),
  );
  const padding = (maxPrice - minPrice) * 0.15;

  // Price-axis zoom (TradingView/Moomoo style): dragging the right-hand price
  // scale stretches or compresses the visible price range around its own
  // center without touching the data, x-axis, or panel heights. 1 = the
  // normal auto-fit range; >1 zooms out (shorter-looking candles), <1 zooms
  // in. Resets whenever the timeframe/symbol changes so a new period always
  // starts auto-fit.
  const [axisZoom, setAxisZoom] = useState(1);
  useEffect(() => { setAxisZoom(1); }, [timeframe, symbol]);
  const axisDragRef = useRef<{ startY: number; startZoom: number } | null>(null);
  const handleAxisDragStart = useCallback((e: React.PointerEvent) => {
    if (!showPriceAxis) return;
    e.preventDefault();
    axisDragRef.current = { startY: e.clientY, startZoom: axisZoom };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, [showPriceAxis, axisZoom]);
  const handleAxisDragMove = useCallback((e: React.PointerEvent) => {
    const start = axisDragRef.current;
    if (!start) return;
    const dy = e.clientY - start.startY;
    // Drag down = zoom out (taller range, chart looks flatter); drag up = zoom in.
    const next = Math.min(4, Math.max(0.25, start.startZoom * (1 + dy / 150)));
    setAxisZoom(next);
  }, []);
  const handleAxisDragEnd = useCallback(() => { axisDragRef.current = null; }, []);
  const handleAxisDoubleClick = useCallback(() => setAxisZoom(1), []);

  // Crosshair overlay position. Recharts v3 no longer hands mouse/touch handlers an
  // `activePayload` — it hands them a small { activeIndex, activeCoordinate, ... } state
  // object as the FIRST argument (the raw DOM event is the second argument). activeCoordinate.y
  // is NOT reliably snapped to the plotted value's pixel position (it can trail the actual
  // mouse/touch position instead), so the dot would drift off the line. We only trust
  // activeCoordinate.x (the category/index position, which recharts gets right), and derive
  // the y pixel ourselves from the real price value + the measured plot area + the known
  // domain/margins — guaranteeing the dot always sits exactly on the price line. This same
  // handler is wired to both onMouseMove (desktop) and onTouchMove (mobile drag) — v3
  // requires touch to be wired explicitly, it is no longer inferred from onMouseMove.
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; fraction: number } | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const PLOT_MARGIN_TOP = 8;

  const autoDomainMin = minPrice - padding;
  const autoDomainMax = maxPrice + padding;
  const domainCenter = (autoDomainMin + autoDomainMax) / 2;
  const domainHalf = ((autoDomainMax - autoDomainMin) / 2) * axisZoom;
  const domainMin = domainCenter - domainHalf;
  const domainMax = domainCenter + domainHalf;

  const updateFromChartState = useCallback((state: any) => {
    const idx = state?.activeIndex != null ? Number(state.activeIndex) : NaN;
    const coord = state?.activeCoordinate;
    if (Number.isFinite(idx) && data[idx] && coord) {
      const point = data[idx];
      const rect = plotRef.current?.getBoundingClientRect();
      const plotHeight = rect ? Math.max(1, rect.height - PLOT_MARGIN_TOP) : 0;
      const priceY = domainMax === domainMin
        ? PLOT_MARGIN_TOP + plotHeight / 2
        : PLOT_MARGIN_TOP + (1 - (point.price - domainMin) / (domainMax - domainMin)) * plotHeight;
      const plotWidth = rect?.width || 1;
      setCrosshair({ x: coord.x, y: priceY, fraction: Math.min(1, Math.max(0, coord.x / plotWidth)) });
      // Change is always relative to the first point of the currently selected
      // timeframe, so scrubbing a 1M chart shows gain/loss vs. a month ago, not vs. today.
      const pointChangePercent = firstPrice ? ((point.price - firstPrice) / firstPrice) * 100 : 0;
      const pointIsUp = point.price >= firstPrice;
      onHoverPrice?.(point.price, point.date, pointChangePercent, pointIsUp);
      chartHaptic();
    }
  }, [data, onHoverPrice, firstPrice, domainMin, domainMax]);

  const handleLeave = useCallback(() => {
    if (pinCrosshair) return;
    setCrosshair(null);
    onHoverPrice?.(null, null, null, null);
  }, [onHoverPrice, pinCrosshair]);

  // ---- Trendline draw tool -------------------------------------------------
  // Every line is stored as (relative-x-fraction, real price) pairs rather
  // than raw pixels, so it's genuinely anchored to the data: zooming the
  // price axis (axisZoom above) or resizing the pane recomputes the pixel
  // position correctly instead of the line drifting off what it was drawn on.
  type DrawLine = { xFrac1: number; price1: number; xFrac2: number; price2: number };
  const [lines, setLines] = useState<(DrawLine & { id: number })[]>([]);
  const [draftLine, setDraftLine] = useState<DrawLine | null>(null);
  const drawingRef = useRef(false);
  const lineIdRef = useRef(0);

  // Plot pixel size, tracked reactively (not just read on-demand) so stored
  // lines re-render at the right spot whenever the pane resizes.
  const [plotSize, setPlotSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = plotRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setPlotSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pixelToDrawValue = useCallback((clientX: number, clientY: number): { xFrac: number; price: number } | null => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return null;
    const xFrac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const plotHeight = Math.max(1, rect.height - PLOT_MARGIN_TOP);
    const price = domainMax - ((clientY - rect.top - PLOT_MARGIN_TOP) / plotHeight) * (domainMax - domainMin);
    return { xFrac, price };
  }, [domainMin, domainMax]);

  const drawValueToPixel = useCallback((xFrac: number, price: number): { x: number; y: number } | null => {
    if (!plotSize.width || !plotSize.height) return null;
    const plotHeight = Math.max(1, plotSize.height - PLOT_MARGIN_TOP);
    const x = xFrac * plotSize.width;
    const y = domainMax === domainMin
      ? PLOT_MARGIN_TOP + plotHeight / 2
      : PLOT_MARGIN_TOP + (1 - (price - domainMin) / (domainMax - domainMin)) * plotHeight;
    return { x, y };
  }, [plotSize, domainMin, domainMax]);

  // New timeframe/symbol = a different price range and time window, so any
  // existing sketch no longer refers to anything meaningful on screen.
  useEffect(() => { setLines([]); setDraftLine(null); }, [timeframe, symbol]);
  // Caller-driven "clear all" (e.g. a toolbar trash icon) via a bump counter.
  useEffect(() => {
    if (clearDrawSignal === undefined) return;
    setLines([]);
    setDraftLine(null);
  }, [clearDrawSignal]);
  useEffect(() => { onDrawingsChange?.(lines.length > 0); }, [lines.length, onDrawingsChange]);

  const handleDrawPointerDown = useCallback((e: React.PointerEvent) => {
    if (!drawMode) return;
    const v = pixelToDrawValue(e.clientX, e.clientY);
    if (!v) return;
    e.preventDefault();
    drawingRef.current = true;
    setDraftLine({ xFrac1: v.xFrac, price1: v.price, xFrac2: v.xFrac, price2: v.price });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, [drawMode, pixelToDrawValue]);
  const handleDrawPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawMode || !drawingRef.current) return;
    const v = pixelToDrawValue(e.clientX, e.clientY);
    if (!v) return;
    setDraftLine((prev) => (prev ? { ...prev, xFrac2: v.xFrac, price2: v.price } : prev));
  }, [drawMode, pixelToDrawValue]);
  const handleDrawPointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setDraftLine((prev) => {
      if (prev) {
        // Discard a plain tap (no real drag) instead of leaving a stray dot.
        const movedEnough = Math.abs(prev.xFrac2 - prev.xFrac1) > 0.01
          || Math.abs(prev.price2 - prev.price1) > (domainMax - domainMin) * 0.01;
        if (movedEnough) setLines((ls) => [...ls, { id: ++lineIdRef.current, ...prev }]);
      }
      return null;
    });
  }, [domainMin, domainMax]);

  const renderDrawLayer = () => {
    const axisGutter = showPriceAxis ? PRICE_AXIS_WIDTH : 0;
    return (
      <>
        <div
          className="absolute top-0 left-0 bottom-0 z-10"
          style={{ right: axisGutter, touchAction: drawMode ? "none" : undefined, pointerEvents: drawMode ? "auto" : "none", cursor: drawMode ? "crosshair" : undefined }}
          onPointerDown={handleDrawPointerDown}
          onPointerMove={handleDrawPointerMove}
          onPointerUp={handleDrawPointerUp}
          onPointerCancel={handleDrawPointerUp}
        />
        {(lines.length > 0 || draftLine) && (
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            {lines.map((l) => {
              const p1 = drawValueToPixel(l.xFrac1, l.price1);
              const p2 = drawValueToPixel(l.xFrac2, l.price2);
              if (!p1 || !p2) return null;
              return <line key={l.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" />;
            })}
            {draftLine && (() => {
              const p1 = drawValueToPixel(draftLine.xFrac1, draftLine.price1);
              const p2 = drawValueToPixel(draftLine.xFrac2, draftLine.price2);
              if (!p1 || !p2) return null;
              return (
                <>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />
                  <circle cx={p1.x} cy={p1.y} r={2.5} fill="#f59e0b" />
                  <circle cx={p2.x} cy={p2.y} r={2.5} fill="#f59e0b" />
                </>
              );
            })()}
          </svg>
        )}
      </>
    );
  };
  // ---------------------------------------------------------------------

  const domain: [number, number] = [domainMin, domainMax];

  // Price line is two-tone: the actual bull/bear color up to the crosshair, and grey
  // beyond it — the fraction defaults to 1 (fully colored) when nothing is being dragged.
  const crosshairGradId = `ch-${symbol}-${timeframe}`;
  const greyLineColor = "hsl(var(--muted-foreground))";
  const crosshairFraction = crosshair ? crosshair.fraction : 1;

  const renderCrosshair = () => {
    if (!crosshair) return null;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-px bg-foreground/30" style={{ left: crosshair.x, top: 0, bottom: 0 }} />
        <div
          className="absolute h-2.5 w-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 ring-2 ring-background"
          style={{ left: crosshair.x, top: crosshair.y, backgroundColor: lineColor }}
        />
      </div>
    );
  };

  const PRICE_AXIS_WIDTH = 52;

  // Highlighted "current price" tag on the right-hand scale, drawn as part of
  // the ReferenceLine so it always tracks the real plot coordinates (no manual
  // pixel math needed). Recharts hands a horizontal ReferenceLine's label
  // renderer a viewBox already sized to the plot area, so x + width lands
  // exactly at the start of the axis gutter we reserved via YAxis width.
  const renderCurrentPriceTag = (props: { viewBox?: { x: number; y: number; width: number; height: number } }) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const tagWidth = PRICE_AXIS_WIDTH - 2;
    const tagHeight = 16;
    const x = viewBox.x + viewBox.width + 1;
    const y = viewBox.y;
    return (
      <g>
        <rect x={x} y={y - tagHeight / 2} width={tagWidth} height={tagHeight} rx={2} fill={lineColor} />
        <text x={x + tagWidth / 2} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="hsl(var(--background))">
          {lastPrice.toFixed(2)}
        </text>
      </g>
    );
  };

  // Invisible strip laid over the price-scale gutter so a vertical drag there
  // zooms the axis (TradingView/Moomoo style) without interfering with the
  // crosshair drag, which listens on the plot area itself. Double-tap resets
  // to auto-fit.
  const renderPriceAxisDragHandle = () => (
    <div
      className="absolute top-0 right-0 bottom-0 z-10 touch-none cursor-ns-resize"
      style={{ width: PRICE_AXIS_WIDTH }}
      onPointerDown={handleAxisDragStart}
      onPointerMove={handleAxisDragMove}
      onPointerUp={handleAxisDragEnd}
      onPointerCancel={handleAxisDragEnd}
      onDoubleClick={handleAxisDoubleClick}
    />
  );

  // Overlay lines share one distinct palette so MA/EMA/BOLL stay visually
  // separable from each other and from the price series itself.
  const OVERLAY_COLORS = { ma5: "#f59e0b", ma20: "#3b82f6", ma50: "#8b5cf6", ema12: "#14b8a6", ema26: "#ec4899", boll: "#94a3b8", sar: "#f59e0b" };

  const renderOverlays = () => (
    <>
      {indicators.overlays.ma && (
        <>
          <Line type="monotone" dataKey="ma5" stroke={OVERLAY_COLORS.ma5} strokeWidth={1.1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="ma20" stroke={OVERLAY_COLORS.ma20} strokeWidth={1.1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="ma50" stroke={OVERLAY_COLORS.ma50} strokeWidth={1.1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
        </>
      )}
      {indicators.overlays.ema && (
        <>
          <Line type="monotone" dataKey="ema12" stroke={OVERLAY_COLORS.ema12} strokeWidth={1.1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="ema26" stroke={OVERLAY_COLORS.ema26} strokeWidth={1.1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
        </>
      )}
      {indicators.overlays.boll && (
        <>
          <Line type="monotone" dataKey="bollUpper" stroke={OVERLAY_COLORS.boll} strokeWidth={1} strokeDasharray="3 3" dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="bollMid" stroke={OVERLAY_COLORS.boll} strokeWidth={1} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          <Line type="monotone" dataKey="bollLower" stroke={OVERLAY_COLORS.boll} strokeWidth={1} strokeDasharray="3 3" dot={false} activeDot={false} isAnimationActive={false} connectNulls />
        </>
      )}
      {indicators.overlays.sar && (
        <Line
          type="monotone"
          dataKey="sar"
          stroke={OVERLAY_COLORS.sar}
          strokeWidth={0}
          dot={{ r: 1.6, fill: OVERLAY_COLORS.sar, strokeWidth: 0 }}
          activeDot={false}
          isAnimationActive={false}
          connectNulls
        />
      )}
    </>
  );

  const renderSubPanel = () => {
    if (indicators.subPanel === "rsi") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 100]} width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={70} stroke="hsl(var(--bear))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <ReferenceLine y={30} stroke="hsl(var(--bull))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={1.3} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    if (indicators.subPanel === "macd") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
            <XAxis dataKey="date" hide />
            <YAxis hide width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.35} />
            <Bar dataKey="macdHist" isAnimationActive={false} barSize={2}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={(d.macdHist ?? 0) >= 0 ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="macdLine" stroke="#3b82f6" strokeWidth={1.2} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
            <Line type="monotone" dataKey="macdSignal" stroke="#f59e0b" strokeWidth={1.2} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    if (indicators.subPanel === "kdj") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[-20, 120]} width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={80} stroke="hsl(var(--bear))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <ReferenceLine y={20} stroke="hsl(var(--bull))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <Line type="monotone" dataKey="kdjK" stroke="#3b82f6" strokeWidth={1.2} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
            <Line type="monotone" dataKey="kdjD" stroke="#f59e0b" strokeWidth={1.2} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
            <Line type="monotone" dataKey="kdjJ" stroke="#a855f7" strokeWidth={1.2} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    if (indicators.subPanel === "wr") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[-100, 0]} width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={-20} stroke="hsl(var(--bear))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <ReferenceLine y={-80} stroke="hsl(var(--bull))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <Line type="monotone" dataKey="wr" stroke="#ec4899" strokeWidth={1.3} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    if (indicators.subPanel === "cci") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
            <XAxis dataKey="date" hide />
            <YAxis hide width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={100} stroke="hsl(var(--bear))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <ReferenceLine y={-100} stroke="hsl(var(--bull))" strokeOpacity={0.35} strokeDasharray="2 3" />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="cci" stroke="#0ea5e9" strokeWidth={1.3} dot={false} activeDot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  const hasSubPanel = indicators.subPanel !== "none";
  const hasVolume = indicators.volume;
  // Bar width shared by the candle body/wick bars and the volume bars so the
  // two stay visually aligned bar-for-bar (same syncId keeps their x-position
  // locked together too).
  const barSize = data.length > 120 ? 2 : data.length > 60 ? 4 : 7;

  const renderVolumePanel = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} syncId={`chart-${symbol}-${timeframe}`}>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={[0, (max: number) => max * 1.15]} width={showPriceAxis ? PRICE_AXIS_WIDTH : 0} />
        <Tooltip content={() => null} cursor={false} />
        <Bar dataKey="volume" barSize={barSize} isAnimationActive={false} minPointSize={1}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.up ? "hsl(var(--bull))" : "hsl(var(--bear))"} fillOpacity={0.55} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );

  const VolumePanel = () => (
    <div className="shrink-0 border-t border-border/30 pt-1 relative" style={{ height: VOLUME_PANEL_HEIGHT }}>
      <span className="absolute top-0.5 left-1 text-[9px] font-bold text-muted-foreground tracking-wide z-10">VOL</span>
      {renderVolumePanel()}
    </div>
  );

  // The main pane either gets a hard-coded pixel height (embedded chart,
  // `mainHeight` passed in -- never shrinks when Volume/a sub-panel is
  // switched on, they just add their own fixed height below) or fills
  // whatever's left in a flex parent (fullscreen chart, already
  // viewport-bounded so there's nowhere for extra height to go).
  const mainPaneStyle = mainHeight ? { height: mainHeight, flex: "0 0 auto" as const } : undefined;
  const mainPaneClass = mainHeight ? "shrink-0 relative" : "flex-1 min-h-0 relative";
  const outerClass = `relative w-full flex flex-col touch-none ${mainHeight ? "" : "h-full"}`;

  if (chartType === "candle") {
    return (
      <div className={outerClass} onTouchEnd={handleLeave}>
        <div ref={plotRef} className={mainPaneClass} style={mainPaneStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
              onMouseMove={updateFromChartState}
              onMouseLeave={handleLeave}
              onTouchMove={updateFromChartState}
              syncId={`chart-${symbol}-${timeframe}`}
            >
              {showGrid && <CartesianGrid horizontal vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} strokeDasharray="3 3" />}
              <XAxis dataKey="date" hide />
              <YAxis
                hide={!showPriceAxis}
                orientation="right"
                domain={domain}
                width={showPriceAxis ? PRICE_AXIS_WIDTH : 0}
                axisLine={false}
                tickLine={false}
                tickCount={6}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => v.toFixed(2)}
              />
              <Tooltip content={() => null} cursor={false} />
              {showPriceAxis && (
                <ReferenceLine y={lastPrice} stroke={lineColor} strokeDasharray="3 3" strokeOpacity={0.6} label={renderCurrentPriceTag} />
              )}
              <Bar dataKey="wickRange" barSize={1} isAnimationActive={false} activeBar={false}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.up ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                ))}
              </Bar>
              <Bar dataKey="body" barSize={barSize} isAnimationActive={false} minPointSize={1} activeBar={false}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.up ? "hsl(var(--bull))" : "hsl(var(--bear))"} />
                ))}
              </Bar>
              {renderOverlays()}
            </ComposedChart>
          </ResponsiveContainer>
          {renderCrosshair()}
          {showPriceAxis && renderPriceAxisDragHandle()}
          {renderDrawLayer()}
        </div>
        {hasVolume && <VolumePanel />}
        {hasSubPanel && <div className="shrink-0 border-t border-border/30 pt-1" style={{ height: SUB_PANEL_HEIGHT }}>{renderSubPanel()}</div>}
      </div>
    );
  }

  return (
    <div className={outerClass} onTouchEnd={handleLeave}>
      <div ref={plotRef} className={mainPaneClass} style={mainPaneStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            onMouseMove={updateFromChartState}
            onMouseLeave={handleLeave}
            onTouchMove={updateFromChartState}
            syncId={`chart-${symbol}-${timeframe}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
                <stop offset="35%" stopColor={lineColor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={crosshairGradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset={0} stopColor={lineColor} />
                <stop offset={crosshairFraction} stopColor={lineColor} />
                <stop offset={crosshairFraction} stopColor={greyLineColor} />
                <stop offset={1} stopColor={greyLineColor} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid horizontal vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} strokeDasharray="3 3" />}
            <XAxis dataKey="date" hide />
            <YAxis
              hide={!showPriceAxis}
              orientation="right"
              domain={domain}
              width={showPriceAxis ? PRICE_AXIS_WIDTH : 0}
              axisLine={false}
              tickLine={false}
              tickCount={6}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v: number) => v.toFixed(2)}
            />
            <Tooltip content={() => null} cursor={false} />
            <ReferenceLine y={firstPrice} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.35} />
            {showPriceAxis && (
              <ReferenceLine y={lastPrice} stroke={lineColor} strokeDasharray="3 3" strokeOpacity={0.6} label={renderCurrentPriceTag} />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={`url(#${crosshairGradId})`}
              strokeWidth={1.6}
              fill={chartType === "area" ? `url(#${gradientId})` : "transparent"}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            {renderOverlays()}
          </ComposedChart>
        </ResponsiveContainer>
        {renderCrosshair()}
        {showPriceAxis && renderPriceAxisDragHandle()}
        {renderDrawLayer()}
      </div>
      {hasVolume && <VolumePanel />}
      {hasSubPanel && <div className="shrink-0 border-t border-border/30 pt-1" style={{ height: SUB_PANEL_HEIGHT }}>{renderSubPanel()}</div>}
    </div>
  );
};