/**
 * Exchange-agnostic cleanup for MarketIndex, same rationale as
 * normalizePrice.ts: change/changePercent are recomputed from
 * value/previousClose rather than trusted from the feed, since a feed can
 * send a stale delta alongside a fresh value.
 */
import type { MarketIndex } from "../../types/market.js";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function normalizeIndex(index: MarketIndex): MarketIndex {
  const value = round2(index.value);
  const previousClose = round2(index.previousClose);
  const change = round2(value - previousClose);
  const changePercent = previousClose !== 0 ? round2((change / previousClose) * 100) : 0;

  return {
    ...index,
    value, previousClose, change, changePercent,
    code: index.code.trim().toUpperCase(),
  };
}