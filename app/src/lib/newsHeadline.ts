// A single, minimal shape for anything that can appear in the per-stock
// "news" list — whether it's a real NSE filing (from continua-scraper, via
// market.company_announcements) or a mock TradersHub Media article.
//
// The two sources carry genuinely different information (a regulatory
// filing has no sentiment, no summary paragraphs, no view/comment counts —
// fabricating those would misrepresent what the item actually is), so this
// type only keeps the fields every consumer (NewsEventsTab, the Overview
// preview list, AIThesisCard's headline list) actually needs, plus a `kind`
// discriminator so click-handling can differ honestly per source.
import type { CompanyAnnouncement } from "@/api/types";
import type { MediaItem } from "@/data/mediaItems";
import { formatTimestamp } from "@/lib/formatTimestamp";

export interface NewsHeadline {
  id: string;
  kind: "announcement" | "media";
  title: string;
  source: string;
  /** ISO timestamp, or null when the source genuinely doesn't have one yet
   *  (common for freshly-scraped announcements) — never a made-up date. */
  publishedAt: string | null;
  /** Only present for kind === "announcement": the original filing URL. */
  documentUrl?: string;
  /** Only present for kind === "media": drives the bullish/bearish icon. */
  sentiment?: "bullish" | "bearish" | "neutral";
  needsReview?: boolean;
}

export function announcementToHeadline(a: CompanyAnnouncement): NewsHeadline {
  return {
    id: a.id,
    kind: "announcement",
    title: a.title,
    source: a.source,
    publishedAt: a.publishedAt,
    documentUrl: a.documentUrl,
    needsReview: a.needsReview,
  };
}

export function mediaItemToHeadline(m: MediaItem): NewsHeadline {
  return {
    id: m.id,
    kind: "media",
    title: m.title,
    source: m.source,
    publishedAt: m.publishedAt,
    sentiment: m.sentiment,
  };
}

/** Display time for a headline whose publishedAt may be null. */
export function headlineTime(h: NewsHeadline): string {
  return h.publishedAt ? formatTimestamp(h.publishedAt) : "Date not available";
}