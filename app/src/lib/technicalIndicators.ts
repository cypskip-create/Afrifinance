// Pure, dependency-free technical indicator math for the stock chart.
// Each function takes the same point shape the chart already uses
// (StockPriceChart.generateMockData / useHistoricalCandles output) and
// returns one value per input point (null where there isn't enough
// history yet to compute one).

export interface IndicatorPoint {
  price: number;
  close?: number;
  date?: string;
}

/** Which indicators are currently switched on for a chart — overlays draw on the
 *  price chart itself, subPanel is a single secondary panel below it (Moomoo lets
 *  several oscillators be open in tabs; we keep one at a time to keep the chart
 *  readable on a phone screen). Volume isn't offered yet — candle data doesn't
 *  carry a volume field until RealNseClient supplies historical bars with it. */
export interface IndicatorSettings {
  overlays: { ma: boolean; ema: boolean; boll: boolean };
  subPanel: "none" | "macd" | "rsi";
}

export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  overlays: { ma: false, ema: false, boll: false },
  subPanel: "none",
};

export const ALL_INDICATORS_OFF: IndicatorSettings = DEFAULT_INDICATOR_SETTINGS;

export function anyIndicatorsOn(settings: IndicatorSettings): boolean {
  return settings.overlays.ma || settings.overlays.ema || settings.overlays.boll || settings.subPanel !== "none";
}


const closeOf = (d: IndicatorPoint) => d.close ?? d.price;

/** Simple moving average. */
export function sma(data: IndicatorPoint[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(data.length).fill(null);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += closeOf(data[i]);
    if (i >= period) sum -= closeOf(data[i - period]);
    if (i >= period - 1) out[i] = +(sum / period).toFixed(4);
  }
  return out;
}

/** Exponential moving average, seeded with the SMA of the first `period` points. */
export function ema(data: IndicatorPoint[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(data.length).fill(null);
  if (data.length < period) return out;
  const k = 2 / (period + 1);
  let seedSum = 0;
  for (let i = 0; i < period; i++) seedSum += closeOf(data[i]);
  let prev = seedSum / period;
  out[period - 1] = +prev.toFixed(4);
  for (let i = period; i < data.length; i++) {
    prev = closeOf(data[i]) * k + prev * (1 - k);
    out[i] = +prev.toFixed(4);
  }
  return out;
}

/** Bollinger Bands: SMA midline ± (stdDevMultiplier × rolling standard deviation). */
export function bollingerBands(data: IndicatorPoint[], period = 20, stdDevMultiplier = 2) {
  const mid = sma(data, period);
  return data.map((_, i) => {
    const m = mid[i];
    if (m == null) return { upper: null as number | null, mid: null as number | null, lower: null as number | null };
    const slice = data.slice(i - period + 1, i + 1);
    const variance = slice.reduce((s, d) => s + (closeOf(d) - m) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    return { upper: +(m + stdDevMultiplier * sd).toFixed(4), mid: m, lower: +(m - stdDevMultiplier * sd).toFixed(4) };
  });
}

/** Relative Strength Index (Wilder's smoothing). */
export function rsi(data: IndicatorPoint[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(data.length).fill(null);
  if (data.length <= period) return out;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closeOf(data[i]) - closeOf(data[i - 1]);
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : +(100 - 100 / (1 + avgGain / avgLoss)).toFixed(2);
  for (let i = period + 1; i < data.length; i++) {
    const diff = closeOf(data[i]) - closeOf(data[i - 1]);
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : +(100 - 100 / (1 + avgGain / avgLoss)).toFixed(2);
  }
  return out;
}

/** MACD line (EMA-fast − EMA-slow), its signal line (EMA of the MACD line), and histogram. */
export function macd(data: IndicatorPoint[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = ema(data, fastPeriod);
  const emaSlow = ema(data, slowPeriod);
  const macdLine: (number | null)[] = data.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? +((emaFast[i] as number) - (emaSlow[i] as number)).toFixed(4) : null
  );

  // Signal = EMA of the MACD line, computed only over the indices where MACD exists
  // (feeding the null-prefix in would corrupt the EMA seed).
  const validIndices: number[] = [];
  const validPoints: IndicatorPoint[] = [];
  macdLine.forEach((v, i) => {
    if (v != null) { validIndices.push(i); validPoints.push({ price: v }); }
  });
  const signalValid = ema(validPoints, signalPeriod);
  const signal: (number | null)[] = new Array(data.length).fill(null);
  signalValid.forEach((v, idx) => { if (v != null) signal[validIndices[idx]] = v; });

  const histogram: (number | null)[] = macdLine.map((v, i) =>
    v != null && signal[i] != null ? +(v - (signal[i] as number)).toFixed(4) : null
  );

  return { macdLine, signal, histogram };
}