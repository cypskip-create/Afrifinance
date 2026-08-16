/**
 * Exchange-agnostic cleanup applied to every Quote, regardless of which
 * adapter produced it. The adapter's job is translation (NSE fields →
 * standard fields); this layer's job is enforcing Continua-wide rules
 * that apply no matter the source: rounding, derived-field consistency,
 * sane clamping. Runs AFTER mapping, BEFORE validation/storage.
 */
import type { Quote } from "../../types/market.js";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function normalizePrice(quote: Quote): Quote {
  const lastPrice = round2(quote.lastPrice);
  const previousClose = round2(quote.previousClose);
  // Recompute change/changePercent from lastPrice/previousClose rather than
  // trusting the feed's own delta fields — feeds occasionally send a stale
  // change value alongside a fresh price. Source of truth is the two prices.
  const change = round2(lastPrice - previousClose);
  const changePercent = previousClose !== 0 ? round2((change / previousClose) * 100) : 0;

  return {
    ...quote,
    lastPrice, previousClose, change, changePercent,
    open: round2(quote.open),
    high: round2(Math.max(quote.high, quote.open, lastPrice)),
    low: round2(quote.low > 0 ? Math.min(quote.low, quote.open, lastPrice) : Math.min(quote.open, lastPrice)),
    volume: Math.max(0, Math.round(quote.volume)),
    bid: quote.bid != null ? round2(quote.bid) : undefined,
    ask: quote.ask != null ? round2(quote.ask) : undefined,
    symbol: quote.symbol.trim().toUpperCase(),
  };
}