/**
 * INseClient backed by live scraping of afx.kwayisi.org — a free public
 * site meant for human readers, not an API. This does NOT go through the
 * scraper service's compliance pipeline (crawler/robotsCheck.ts, per-source
 * rate limiting, scraping.sources licensing metadata) since it's a
 * request-per-symbol live client like MansaClient, not a discover/fetch/
 * parse crawl job — so robots.txt respect and rate limiting are
 * reimplemented inline here, deliberately, rather than skipped.
 *
 * IMPORTANT — verification status: the parsing logic in afxRawParser.ts
 * was written against the actual text/table content of one real page
 * (https://afx.kwayisi.org/nse/cgen.html, fetched 2026-09-06), but that
 * fetch went through a tool that renders HTML into cleaned markdown/text
 * rather than returning raw tags — so table vs. dl/dt/dd markup, exact
 * class names, etc. are a reasonable inference from that rendered output,
 * not a confirmed reading of the actual HTML source. Treat this as an
 * untested first pass: run `previewQuote()` against a couple of real
 * tickers and compare the output to the live page by eye before trusting
 * this in production, and expect to adjust selectors in afxRawParser.ts
 * once you can see the real markup (e.g. via curl or view-source).
 *
 * Coverage is intentionally partial — see fetchFinancials/
 * fetchCorporateActions/fetchEarningsEvents/fetchOwnership below. The
 * page only ever showed EPS/PE/DPS/dividend yield as snapshot figures,
 * nowhere near the full income statement / balance sheet / cash flow
 * NseRawFinancialPeriod needs, and no dividend-history or ownership
 * breakdown at all. Returning fabricated figures for those would be
 * exactly the kind of fabrication this project has explicitly ruled out
 * elsewhere — so those methods return empty rather than invent data.
 */
import { env } from "../../config/index.js";
import { logger } from "../../monitoring/logger.js";
import { parseAfxQuote, parseAfxSecurityProfile, parseAfxDailyHistory } from "./afxRawParser.js";
import type {
  INseClient,
} from "../nse/nseClient.js";
import type {
  NseRawSecurity, NseRawQuote, NseRawCandle, NseRawCompanyProfile,
  NseRawFinancialPeriod, NseRawCorporateAction, NseRawEarningsEvent, NseRawOwnership,
} from "../nse/nseRawTypes.js";
// Reusing only the existing tracked ticker symbols as a directory of
// "which NSE tickers do we track" — NOT reusing any of nseClient.ts's
// synthetic prices/financials. See AFX_TICKERS in env.ts for how to
// override this with a real, current list instead.
import { KNOWN_NSE_SYMBOLS } from "../nse/knownSymbols.js";

const BASE_URL = "https://afx.kwayisi.org";
const USER_AGENT = "ContinuaBot/1.0 (+https://github.com/cypskip-create/Continua)";

let robotsDisallowedPaths: string[] | null = null;
let lastRequestAt = 0;

async function loadRobotsRules(): Promise<string[]> {
  if (robotsDisallowedPaths) return robotsDisallowedPaths;
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      robotsDisallowedPaths = [];
      return robotsDisallowedPaths;
    }
    const text = await res.text();
    // Minimal parse: Disallow lines under a User-agent: * block (or no
    // User-agent block at all). Good enough for a single-site, no-crawl-
    // delay robots.txt; not a general-purpose robots.txt parser.
    robotsDisallowedPaths = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^disallow:/i.test(line))
      .map((line) => line.split(":").slice(1).join(":").trim())
      .filter(Boolean);
  } catch (err) {
    logger.warn({ err }, "AfxClient: failed to fetch robots.txt — treating as no rules found, proceeding cautiously");
    robotsDisallowedPaths = [];
  }
  return robotsDisallowedPaths;
}

async function isAllowed(path: string): Promise<boolean> {
  const rules = await loadRobotsRules();
  return !rules.some((disallowed) => disallowed && path.startsWith(disallowed));
}

/** Serializes every request through a minimum spacing — see
 *  AFX_MIN_REQUEST_INTERVAL_MS. This is a shared free site, not a paid
 *  API with a documented rate limit, so this errs conservative. */
async function throttle(): Promise<void> {
  const minInterval = env.AFX_MIN_REQUEST_INTERVAL_MS;
  const wait = lastRequestAt + minInterval - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function fetchPage(path: string): Promise<string | null> {
  const allowed = await isAllowed(path);
  if (!allowed) {
    logger.warn({ path }, "AfxClient: path disallowed by robots.txt — skipping");
    return null;
  }
  await throttle();
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    logger.warn({ url, status: res.status }, "AfxClient: fetch failed");
    return null;
  }
  return res.text();
}

function tickerList(): string[] {
  if (env.AFX_TICKERS) {
    return env.AFX_TICKERS.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
  }
  return KNOWN_NSE_SYMBOLS;
}

export class AfxClient implements INseClient {
  /** Not part of INseClient — a convenience for manually checking one
   *  ticker's parse output against the real page before trusting this
   *  client for anything else. */
  async previewQuote(symbol: string): Promise<NseRawQuote | null> {
    const quotes = await this.fetchQuotes([symbol]);
    return quotes[0] ?? null;
  }

  async fetchSecurities(): Promise<NseRawSecurity[]> {
    const symbols = tickerList();
    const results: NseRawSecurity[] = [];
    for (const symbol of symbols) {
      const html = await fetchPage(`/nse/${symbol.toLowerCase()}.html`);
      if (!html) continue;
      const profile = parseAfxSecurityProfile(html, symbol);
      results.push({
        Symbol: profile.symbol,
        CompanyName: profile.companyName ?? profile.symbol,
        Sector: profile.sector ?? "Unknown",
        Industry: profile.industry ?? "Unknown",
        TradingStatus: "ACTIVE",
      });
    }
    return results;
  }

  async fetchQuotes(symbols: string[]): Promise<NseRawQuote[]> {
    const targets = symbols.length ? symbols : tickerList();
    const results: NseRawQuote[] = [];
    for (const symbol of targets) {
      const html = await fetchPage(`/nse/${symbol.toLowerCase()}.html`);
      if (!html) continue;
      const quote = parseAfxQuote(html, symbol);
      if (quote.lastTradedPrice === null) {
        // Narrative sentence wasn't found/didn't match — don't emit a
        // quote with no price at all rather than pass through nulls that
        // look like a real zero-value quote downstream.
        logger.warn({ symbol }, "AfxClient: could not extract a last-traded price — skipping this symbol's quote");
        continue;
      }
      results.push({
        Symbol: quote.symbol,
        LastTradedPrice: quote.lastTradedPrice,
        Open: quote.open ?? quote.lastTradedPrice,
        High: quote.high ?? quote.lastTradedPrice,
        Low: quote.low ?? quote.lastTradedPrice,
        PrevClose: quote.prevClose ?? quote.lastTradedPrice,
        Change: quote.change ?? 0,
        ChangePct: quote.changePct ?? 0,
        Volume: quote.volume ?? 0,
        MarketCapMn: undefined,
        Currency: quote.currency,
        TradingStatus: "ACTIVE",
        EventTimestamp: new Date().toISOString(),
      });
    }
    return results;
  }

  async fetchCandles(symbol: string, interval: NseRawCandle["Interval"]): Promise<NseRawCandle[]> {
    if (interval !== "1D") {
      // Only the 10-day daily history table exists on this source — no
      // intraday granularity to derive 1MIN/5MIN/etc. bars from.
      return [];
    }
    const html = await fetchPage(`/nse/${symbol.toLowerCase()}.html`);
    if (!html) return [];
    const bars = parseAfxDailyHistory(html);
    // O=H=L=C is deliberate — see the module doc comment on why this is
    // an honest "close-only" bar, not a fabricated intraday range.
    return bars.map((bar) => ({
      Symbol: symbol.toUpperCase(),
      Interval: "1D" as const,
      BarTime: `${bar.date}T00:00:00Z`,
      O: bar.close, H: bar.close, L: bar.close, C: bar.close,
      V: bar.volume ?? 0,
    }));
  }

  async fetchCompanyProfile(symbol: string): Promise<NseRawCompanyProfile | null> {
    const html = await fetchPage(`/nse/${symbol.toLowerCase()}.html`);
    if (!html) return null;
    const profile = parseAfxSecurityProfile(html, symbol);
    return {
      Symbol: profile.symbol,
      Description: profile.description ?? undefined,
      Headquarters: profile.headquarters ?? undefined,
      Website: profile.website ?? undefined,
      // Not present on this source at all — left undefined rather than "N/A".
      ChiefExecutive: undefined,
      EmployeeCount: undefined,
      FoundedYear: undefined,
    };
  }

  // Not available from this source — see module doc comment. Empty,
  // not fabricated, matching how RealNseClient already handles the gaps
  // in its own upstream (Mansa).
  async fetchFinancials(_symbol: string): Promise<NseRawFinancialPeriod[]> { return []; }
  async fetchCorporateActions(_symbol: string | null, _since: string): Promise<NseRawCorporateAction[]> { return []; }
  async fetchEarningsEvents(_symbol: string | null, _since: string): Promise<NseRawEarningsEvent[]> { return []; }
  async fetchOwnership(_symbol: string): Promise<NseRawOwnership[]> { return []; }

  streamQuotes(symbols: string[], onTick: (q: NseRawQuote) => void): () => void {
    logger.info(
      { intervalMs: env.AFX_POLL_INTERVAL_MS },
      "AfxClient.streamQuotes: polling a public HTML page, not a real push feed — interval is deliberately coarse",
    );
    let stopped = false;
    const pollLoop = async () => {
      while (!stopped) {
        try {
          const quotes = await this.fetchQuotes(symbols);
          for (const quote of quotes) onTick(quote);
        } catch (err) {
          logger.error({ err }, "AfxClient.streamQuotes: poll failed");
        }
        await new Promise((resolve) => setTimeout(resolve, env.AFX_POLL_INTERVAL_MS));
      }
    };
    void pollLoop();
    return () => { stopped = true; };
  }
}