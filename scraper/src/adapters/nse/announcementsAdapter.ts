/**
 * NSE-specific knowledge lives here and ONLY here — the generic crawler
 * (crawler/crawlSource.ts) has no idea this adapter exists.
 *
 * Based on actually fetching https://www.nse.co.ke/listed-company-announcements/
 * (2026-08-27): announcement titles are headings (h1-h4) immediately
 * followed by a link straight to a PDF under nse.co.ke/wp-content/uploads/
 * — there is no separate "announcement detail page" in between on this
 * listing, unlike the multi-step chain the original spec described as a
 * possibility. We pair each PDF link with its nearest PRECEDING heading
 * rather than hardcoding CSS classes, since WordPress markup/classes
 * weren't inspectable from here and the spec explicitly warns against
 * assuming a fixed structure (§11).
 *
 * KNOWN GAP: the page has year-filter tabs (2026 down to 2015) that only
 * surface a handful of items per load — these are almost certainly
 * AJAX-driven and require a real browser to drive (Phase 4). This
 * adapter's discover() only sees what's server-rendered on initial load,
 * i.e. the most recent announcements. It is NOT a full historical
 * backfill yet — don't rely on it for that until Phase 4 lands.
 */
import * as cheerio from "cheerio";
import { fetchWithRetry } from "../../crawler/httpClient.js";
import { isAllowedByRobots } from "../../crawler/robotsCheck.js";
import { sha256 } from "../../crawler/hash.js";
import { resolveUrl } from "../../crawler/urlNormalize.js";
import { storeRawArtifact } from "../../storage/rawStorage.js";
import { upsertArtifact } from "../../storage/rawArtifactsRepository.js";
import { getSource } from "../../storage/sourcesRepository.js";
import { logger } from "../../monitoring/logger.js";
import type { FetchedDocument, ParsedExtraction, SourceAdapter, SourceDocument } from "../types.js";
import { extractPdfText } from "../../extraction/pdfText.js";
import { env } from "../../config/index.js";

const ADAPTER_ID = "nse";
const CRAWLER_VERSION = "scraper-phase6-0.1.0";
const ANNOUNCEMENTS_URL = "https://www.nse.co.ke/listed-company-announcements/";

/** NSE's configured requestsPerSecond, if set in scraping.sources.config; falls back to the service default. */
async function getRequestsPerSecond(): Promise<number> {
  const source = await getSource(ADAPTER_ID);
  return source?.config.requestsPerSecond ?? env.DEFAULT_REQUESTS_PER_SECOND;
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

/**
 * Walks the page in document order, tracking the most recent heading
 * text seen, and pairs it with each PDF link encountered after it. This
 * is a heuristic (§11 explicitly allows/expects this for sources without
 * a fixed structure), not a guarantee — a page that puts the PDF link
 * BEFORE its heading, or several PDFs under one heading, will pair
 * imperfectly. Titles are provenance context, not load-bearing data; the
 * PDF URL itself is exact.
 */
function parseAnnouncementsPage(html: string, pageUrl: string): SourceDocument[] {
  const $ = cheerio.load(html);
  const docs: SourceDocument[] = [];
  let lastHeading: string | null = null;
  const seenUrls = new Set<string>();

  $("h1, h2, h3, h4, a[href]").each((_, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase();
    if (tag && /^h[1-4]$/.test(tag)) {
      const text = $(el).text().trim();
      if (text) lastHeading = text;
      return;
    }

    const href = $(el).attr("href");
    if (!href || !isPdfUrl(href)) return;

    const resolved = resolveUrl(pageUrl, href);
    if (!resolved || seenUrls.has(resolved)) return;
    seenUrls.add(resolved);

    docs.push({
      url: resolved,
      title: lastHeading,
      discoveredFrom: pageUrl,
      context: { titleHeuristic: "nearest_preceding_heading" },
    });
  });

  return docs;
}

export const nseAnnouncementsAdapter: SourceAdapter = {
  id: ADAPTER_ID,

  async discover(): Promise<SourceDocument[]> {
    const allowed = await isAllowedByRobots(ANNOUNCEMENTS_URL);
    if (!allowed) {
      logger.warn({ url: ANNOUNCEMENTS_URL }, "NSE announcements page disallowed by robots.txt — discover() returning nothing");
      return [];
    }

    const res = await fetchWithRetry(ANNOUNCEMENTS_URL, { requestsPerSecond: await getRequestsPerSecond() });
    if (res.status >= 400) {
      throw new Error(`Failed to fetch NSE announcements page: HTTP ${res.status}`);
    }
    const html = res.body.toString("utf-8");
    const docs = parseAnnouncementsPage(html, res.finalUrl);
    logger.info({ count: docs.length }, "NSE discover() found announcement PDFs");
    return docs;
  },

  async fetch(document: SourceDocument): Promise<FetchedDocument> {
    const res = await fetchWithRetry(document.url, { requestsPerSecond: await getRequestsPerSecond() });
    if (res.status >= 400) {
      throw new Error(`Failed to fetch ${document.url}: HTTP ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    const bodyHash = sha256(res.body);
    const storagePath = await storeRawArtifact({
      sourceId: ADAPTER_ID,
      sha256: bodyHash,
      contentType,
      body: res.body,
    });

    const { artifact, isNew } = await upsertArtifact({
      sourceId: ADAPTER_ID,
      adapter: ADAPTER_ID,
      sha256: bodyHash,
      documentUrl: res.finalUrl,
      sourceUrl: document.discoveredFrom,
      contentType,
      sizeBytes: res.body.byteLength,
      storagePath,
      title: document.title ?? null,
      crawlerVersion: CRAWLER_VERSION,
      metadata: document.context ?? {},
    });

    return {
      document,
      sha256: bodyHash,
      contentType,
      sizeBytes: res.body.byteLength,
      storagePath,
      body: res.body,
      isNewArtifact: isNew,
      artifactId: artifact.id,
    };
  },

  async parse(fetched: FetchedDocument): Promise<ParsedExtraction> {
    const isPdf = (fetched.contentType ?? "").includes("application/pdf") || isPdfUrl(fetched.document.url);
    if (!isPdf) {
      // Non-PDF document reached via this adapter (shouldn't normally
      // happen given discover() only returns PDF links, but don't crash
      // if NSE's markup changes) — flagged, not silently skipped.
      return {
        method: "html",
        confidence: null,
        text: null,
        tables: [],
        entity: { companyName: fetched.document.title ?? null, ticker: null, exchange: "NSE" },
        needsReview: true,
      };
    }

    const extraction = await extractPdfText(fetched.body);
    return {
      ...extraction,
      // Company name is whatever the source's own heading said — never
      // an inferred ticker (§12). Entity resolution happens downstream
      // in continua-data, not here.
      entity: { companyName: fetched.document.title ?? null, ticker: null, exchange: "NSE" },
    };
  },
};