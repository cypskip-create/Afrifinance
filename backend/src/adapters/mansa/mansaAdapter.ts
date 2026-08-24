/**
 * Implements IExchangeAdapter on top of Mansa API. One class, parameterized
 * by exchange code, serves every exchange in ACTIVE_EXCHANGES — unlike
 * NseAdapter (which is hardcoded to NSE because its data source, the mock
 * client, only knows NSE), this adapter is exchange-agnostic because
 * Mansa's own API already is. Registering a new Mansa-covered exchange is
 * therefore just `new MansaAdapter("USE")` in registry.ts plus adding "USE"
 * to ACTIVE_EXCHANGES — no new adapter code.
 *
 * WHAT THIS DOES NOT COVER (honest gaps, not silently degraded data):
 *  - getEarningsEvents: Mansa has no earnings-calendar endpoint. Always []
 *    for now — see the comment on that method for the closest proxy.
 *  - getOwnership: Mansa has no shareholder/ownership-breakdown endpoint.
 *    Always [].
 *  - getCorporateActions: only dividends, and only for NGX (Mansa's
 *    /dividends endpoint is NGX-only, Premium tier). Splits/bonus issues/
 *    rights issues aren't exposed by Mansa for any exchange today.
 *  - subscribeQuotes: Mansa has no push/streaming feed. This polls on an
 *    interval, capped so it can't out-request Mansa's own ~30-minute
 *    server-side refresh cadence — polling faster just re-fetches the same
 *    cached value and burns your daily request quota for nothing.
 */
import type { IExchangeAdapter, FundamentalsBundle } from "../types.js";
import type { Quote, Candle, Security, CorporateAction, EarningsEvent, OwnershipRecord, MarketIndex } from "../../types/market.js";
import type { ExchangeCode } from "../../config/index.js";
import { MansaClient, MansaApiError, type IMansaClient } from "./mansaClient.js";
import {
  mapSecurity, mapQuote, mapCandle, mapFundamentalsBundle, mapDividendToCorporateAction, mapIndex,
} from "./mansaMapper.js";
import { logger } from "../../monitoring/logger.js";

const POLL_FLOOR_MS = 60_000; // never poll Mansa more often than this, regardless of what's requested

export class MansaAdapter implements IExchangeAdapter {
  readonly exchange: ExchangeCode;
  private client: IMansaClient;

  constructor(exchange: ExchangeCode, client: IMansaClient = new MansaClient()) {
    this.exchange = exchange;
    this.client = client;
  }

  async listSecurities(): Promise<Security[]> {
    const securities: Security[] = [];
    let offset = 0;
    const limit = 200; // Mansa's documented per-page cap
    let reportedTotal: number | undefined;
    for (;;) {
      const page = await this.client.fetchStocks(this.exchange, { limit, offset });
      // `page.meta.count`, when Mansa sends it, is the TOTAL number of
      // securities Mansa has for this exchange — independent of how many
      // came back on this page. We only ever paginated off `page.data.length`
      // before, so a short page (e.g. 17 rows) looked identical whether
      // Mansa's whole NSE universe really is 17 names, or whether it's
      // bigger and something (tier gating, a quota-throttled response,
      // etc.) truncated this call. Logging both numbers turns that from a
      // guess into something visible in the boot log.
      reportedTotal = page.meta?.count ?? reportedTotal;
      securities.push(...page.data.map((raw) => mapSecurity(this.exchange, raw)));
      if (page.data.length < limit) break;
      offset += limit;
    }
    if (reportedTotal !== undefined && reportedTotal !== securities.length) {
      logger.warn(
        { exchange: this.exchange, received: securities.length, mansaReportedTotal: reportedTotal },
        "Mansa's listSecurities returned fewer securities than its own meta.count reports — likely tier gating or a truncated response, not the full exchange universe."
      );
    } else {
      logger.info(
        { exchange: this.exchange, received: securities.length, mansaReportedTotal: reportedTotal ?? "not provided by Mansa" },
        "Mansa listSecurities result"
      );
    }
    return securities;
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    // Mansa has no batch-quote-by-symbol-list endpoint, only per-ticker or
    // whole-exchange-list. For a handful of symbols (the common case —
    // refreshing a watchlist or a portfolio's holdings), per-ticker calls
    // are the accurate choice. For "give me the whole exchange", callers
    // should use listSecurities()/getExchangeStocks() instead of passing
    // every symbol here, to stay within the free-tier request budget.
    const results = await Promise.allSettled(symbols.map((symbol) => this.client.fetchStock(this.exchange, symbol)));
    const quotes: Quote[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        quotes.push(mapQuote(this.exchange, result.value.data));
      }
      // A rejected lookup (unknown ticker, rate limit, etc) is dropped
      // rather than thrown — one bad symbol in a batch shouldn't fail the
      // whole quote refresh. Callers can diff `symbols` against the
      // returned quotes to see what didn't resolve.
    }
    return quotes;
  }

  async getIndices(): Promise<MarketIndex[]> {
    try {
      const result = await this.client.fetchIndices(this.exchange);
      return result.data.map((raw) => mapIndex(this.exchange, raw));
    } catch (err) {
      if (err instanceof MansaApiError && err.status === 404) return []; // exchange has no tracked indices in Mansa
      throw err;
    }
  }

  async getCandles(symbol: string, interval: Candle["interval"], from: string, to: string): Promise<Candle[]> {
    if (interval !== "1d") {
      // Mansa's /history endpoint is daily OHLCV only — no intraday, no
      // weekly/monthly aggregation server-side. Returning [] rather than
      // silently substituting daily bars under a different interval label,
      // which would misrepresent the data to any chart reading this.
      return [];
    }
    const history = await this.client.fetchHistory(this.exchange, symbol, { from, to });
    return history.data.points.map((point) => mapCandle(this.exchange, symbol, point, history.data.price_unit));
  }

  async getFundamentals(symbol: string): Promise<FundamentalsBundle | null> {
    try {
      const [fundamentals, stockDetail] = await Promise.all([
        this.client.fetchFundamentals(this.exchange, symbol),
        this.client.fetchStock(this.exchange, symbol).catch(() => null),
      ]);
      const latestPeriod = fundamentals.data.periods[0];
      if (!latestPeriod) return null;
      return mapFundamentalsBundle(
        this.exchange,
        symbol,
        fundamentals.data.company_name,
        stockDetail?.data ?? null,
        latestPeriod
      );
    } catch (err) {
      if (err instanceof MansaApiError && err.status === 404) return null;
      throw err; // tier/auth errors should surface, not be swallowed as "no data"
    }
  }

  async getCorporateActions(symbol: string | null, since: string): Promise<CorporateAction[]> {
    if (this.exchange !== "NGX" || !symbol) {
      // Mansa's dividends endpoint is NGX-only and requires a specific
      // ticker (no "all corporate actions since X" endpoint exists for any
      // exchange). Every other case genuinely has no data source here.
      return [];
    }
    try {
      const dividends = await this.client.fetchDividends(this.exchange, symbol);
      return dividends.history
        .filter((d) => d.ex_dividend_date >= since)
        .map((d) => mapDividendToCorporateAction(this.exchange, symbol, d));
    } catch (err) {
      if (err instanceof MansaApiError) return []; // likely an unentitled tier — degrade to "none available"
      throw err;
    }
  }

  async getEarningsEvents(_symbol: string | null, _since: string): Promise<EarningsEvent[]> {
    // No earnings-calendar endpoint in Mansa API today. The closest proxy —
    // NGX's /disclosures endpoint filtered to type=FinancialStatement —
    // returns filing announcements, not the estimate/actual EPS structure
    // EarningsEvent needs, and is NGX-only anyway. Left unimplemented
    // rather than approximated.
    return [];
  }

  async getOwnership(_symbol: string): Promise<OwnershipRecord[]> {
    // No shareholder/ownership-breakdown endpoint in Mansa API. NGX's
    // /insider-trades comes closest but is transaction history, not a
    // point-in-time ownership breakdown — different shape, not a
    // substitute.
    return [];
  }

  subscribeQuotes(symbols: string[], onQuote: (quote: Quote) => void): () => void {
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const quotes = await this.getQuotes(symbols);
        quotes.forEach(onQuote);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[MansaAdapter:${this.exchange}] subscribeQuotes poll failed:`, err);
      }
      if (!cancelled) setTimeout(poll, POLL_FLOOR_MS);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }
}