/**
 * Rolls lower-timeframe candles up into higher timeframes (e.g. 1m → 1h,
 * 1d → 1w/1M/1y). Used by the historical pipeline so we don't have to fetch
 * every timeframe independently from the adapter — one fine-grained pull,
 * many derived resolutions.
 */
import type { Candle, CandleInterval } from "../../types/market.js";

const BUCKET_MS: Record<CandleInterval, number> = {
  "1m": 60_000, "5m": 5 * 60_000, "15m": 15 * 60_000, "1h": 3_600_000,
  "1d": 86_400_000, "1w": 7 * 86_400_000, "1M": 30 * 86_400_000, "1y": 365 * 86_400_000,
};

export function aggregateCandles(source: Candle[], targetInterval: CandleInterval): Candle[] {
  if (source.length === 0) return [];
  const bucketMs = BUCKET_MS[targetInterval];
  const sorted = [...source].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const buckets = new Map<number, Candle[]>();
  for (const candle of sorted) {
    const t = new Date(candle.timestamp).getTime();
    const bucketStart = Math.floor(t / bucketMs) * bucketMs;
    const arr = buckets.get(bucketStart) ?? [];
    arr.push(candle);
    buckets.set(bucketStart, arr);
  }

  const result: Candle[] = [];
  for (const [bucketStart, candles] of Array.from(buckets.entries()).sort((a, b) => a[0] - b[0])) {
    result.push({
      securityId: candles[0]!.securityId,
      interval: targetInterval,
      timestamp: new Date(bucketStart).toISOString(),
      open: candles[0]!.open,
      close: candles[candles.length - 1]!.close,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      volume: candles.reduce((sum, c) => sum + c.volume, 0),
    });
  }
  return result;
}